"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import Marker from "./Marker";
import styles from "./SystemsLab.module.css";

type NodeId = "client" | "gateway" | "auth" | "service" | "cache" | "db" | "queue" | "worker" | "ops";

interface Topic {
  label: string;
  topic: string;
  summary: string;
  points: string[];
}

const TOPICS: Record<NodeId, Topic> = {
  client: {
    label: "Client",
    topic: "The caller",
    summary: "A browser, a mobile app or another service. It is on an unreliable network and it will retry.",
    points: [
      "Set timeouts; a request that never returns is worse than one that fails.",
      "Retries need backoff, and writes need an idempotency key so a retry cannot double-charge.",
    ],
  },
  gateway: {
    label: "API",
    topic: "API design",
    summary: "The contract. Everything behind it can change as long as this stays predictable.",
    points: [
      "Resource-oriented routes and status codes that mean what they say.",
      "Validate input at the edge and return one consistent error shape.",
      "Paginate lists, rate-limit callers, and version before you break anything.",
    ],
  },
  auth: {
    label: "Auth",
    topic: "Authentication & authorization",
    summary: "Two different questions: who is this, and are they allowed to do that to this record?",
    points: [
      "Authentication verifies the token: signature, expiry, issuer.",
      "Authorization checks role and ownership on every request, on the server.",
      "Fail closed. An unverified request never reaches business logic.",
    ],
  },
  service: {
    label: "Service",
    topic: "Business logic & error handling",
    summary: "Where the rules live. It should be testable without a network or a database attached.",
    points: [
      "Keep the rules here and out of route handlers and SQL.",
      "Throw specific errors and map them to status codes in one place.",
      "Put a timeout on every downstream call, then decide what failing means.",
    ],
  },
  cache: {
    label: "Cache",
    topic: "Caching",
    summary: "A fast copy of something expensive to compute. Never the source of truth.",
    points: [
      "Cache-aside: read the cache, fall back to the database, write the result back.",
      "Give every key a TTL and invalidate on write.",
      "Decide up front how stale each answer is allowed to be.",
    ],
  },
  db: {
    label: "Database",
    topic: "Queries & indexing",
    summary: "The source of truth, and usually the first thing to get slow.",
    points: [
      "Index the columns you filter and sort by, and read the query plan to check it is used.",
      "Watch for N+1 queries hiding behind a loop.",
      "Wrap multi-row changes in a transaction so they succeed or fail together.",
    ],
  },
  queue: {
    label: "Queue",
    topic: "Asynchronous processing",
    summary: "Answer the user now, do the slow part afterwards. Emails, notifications, reports.",
    points: [
      "The request only has to enqueue a job; the response does not wait for it.",
      "Delivery is at least once, so a job may arrive twice.",
      "Queue depth is the first metric to alert on.",
    ],
  },
  worker: {
    label: "Worker",
    topic: "Reliability",
    summary: "Failure is a normal input. The design question is what happens next.",
    points: [
      "Handlers are idempotent, so running one twice is safe.",
      "Retry with exponential backoff instead of hammering a struggling dependency.",
      "After the last attempt, move the job to a dead-letter queue and tell a human.",
    ],
  },
  ops: {
    label: "Deploy · Monitor",
    topic: "Deployment & monitoring",
    summary: "Everything above runs somewhere, and somebody has to know when it stops.",
    points: [
      "CI runs lint, tests and the build on every change; the same container goes to every environment.",
      "Infrastructure is described in code, so an environment can be rebuilt and reviewed.",
      "Logs, metrics and traces share a request id. Health checks and a rollback path come first.",
    ],
  },
};

interface Step {
  from: NodeId;
  to: NodeId;
  text: string;
  fail?: boolean;
}

interface Scenario {
  name: string;
  request: string;
  result: string;
  steps: Step[];
}

const SCENARIOS: Scenario[] = [
  {
    name: "Cached read",
    request: "GET /tickets/42",
    result: "200 OK, without touching the database",
    steps: [
      { from: "client", to: "gateway", text: "Request arrives. The route matches and the input is validated." },
      { from: "gateway", to: "auth", text: "The token is verified: signature, expiry, permissions." },
      { from: "auth", to: "gateway", text: "Identity attached to the request." },
      { from: "gateway", to: "service", text: "The service checks this user may read this ticket." },
      { from: "service", to: "cache", text: "Cache lookup: hit." },
      { from: "cache", to: "service", text: "Cached ticket returned." },
      { from: "service", to: "gateway", text: "Response serialised." },
      { from: "gateway", to: "client", text: "200 OK." },
    ],
  },
  {
    name: "Cache miss",
    request: "GET /tickets/42",
    result: "200 OK, and the next read is fast",
    steps: [
      { from: "client", to: "gateway", text: "Request arrives and is validated." },
      { from: "gateway", to: "auth", text: "Token verified." },
      { from: "auth", to: "gateway", text: "Identity attached." },
      { from: "gateway", to: "service", text: "Authorised to read this ticket." },
      { from: "service", to: "cache", text: "Cache lookup: miss.", fail: true },
      { from: "cache", to: "service", text: "Nothing cached. Fall back to the database." },
      { from: "service", to: "db", text: "Indexed lookup by primary key." },
      { from: "db", to: "service", text: "Row returned." },
      { from: "service", to: "cache", text: "Result written to the cache with a TTL." },
      { from: "service", to: "gateway", text: "Response serialised." },
      { from: "gateway", to: "client", text: "200 OK." },
    ],
  },
  {
    name: "Write + background job",
    request: "POST /tickets",
    result: "201 Created now, notification a moment later",
    steps: [
      { from: "client", to: "gateway", text: "Body validated against the schema." },
      { from: "gateway", to: "auth", text: "Token verified." },
      { from: "auth", to: "gateway", text: "Identity attached." },
      { from: "gateway", to: "service", text: "Business rules applied: defaults, assignment, SLA." },
      { from: "service", to: "db", text: "Ticket inserted inside a transaction." },
      { from: "db", to: "service", text: "Committed." },
      { from: "service", to: "cache", text: "Stale list entries invalidated." },
      { from: "service", to: "queue", text: "A notification job is enqueued." },
      { from: "service", to: "gateway", text: "The response does not wait for the job." },
      { from: "gateway", to: "client", text: "201 Created." },
      { from: "queue", to: "worker", text: "Meanwhile, a worker picks the job up." },
      { from: "worker", to: "db", text: "Notification sent and recorded." },
    ],
  },
  {
    name: "Rejected request",
    request: "DELETE /tickets/42",
    result: "401 Unauthorized, and nothing behind the edge ran",
    steps: [
      { from: "client", to: "gateway", text: "Request arrives." },
      { from: "gateway", to: "auth", text: "The token has expired.", fail: true },
      { from: "auth", to: "gateway", text: "Rejected. Business logic is never reached.", fail: true },
      { from: "gateway", to: "client", text: "401 Unauthorized, in the standard error shape.", fail: true },
    ],
  },
  {
    name: "A job fails",
    request: "job: send-notification",
    result: "Delivered on the second attempt, exactly one notification sent",
    steps: [
      { from: "queue", to: "worker", text: "Attempt 1. The downstream provider times out.", fail: true },
      { from: "worker", to: "queue", text: "Re-queued with exponential backoff.", fail: true },
      { from: "queue", to: "worker", text: "Attempt 2 succeeds. The handler is idempotent, so a repeat is safe." },
      { from: "worker", to: "db", text: "Outcome recorded. Had every retry failed: dead-letter queue and an alert." },
    ],
  },
];

type Point = { x: number; y: number };
interface Layout {
  view: [number, number];
  box: [number, number];
  nodes: Record<Exclude<NodeId, "ops">, Point>;
  ops: { x: number; y: number; w: number; h: number };
}

const DESKTOP: Layout = {
  view: [1000, 470],
  box: [136, 56],
  nodes: {
    client: { x: 78, y: 200 },
    gateway: { x: 290, y: 200 },
    auth: { x: 290, y: 64 },
    service: { x: 530, y: 200 },
    cache: { x: 690, y: 64 },
    db: { x: 850, y: 200 },
    queue: { x: 530, y: 336 },
    worker: { x: 850, y: 336 },
  },
  ops: { x: 10, y: 410, w: 980, h: 48 },
};

const MOBILE: Layout = {
  view: [360, 560],
  box: [116, 48],
  nodes: {
    client: { x: 105, y: 34 },
    gateway: { x: 105, y: 130 },
    auth: { x: 268, y: 130 },
    service: { x: 105, y: 240 },
    cache: { x: 268, y: 205 },
    queue: { x: 268, y: 290 },
    db: { x: 105, y: 400 },
    worker: { x: 268, y: 400 },
  },
  ops: { x: 6, y: 488, w: 348, h: 48 },
};

const EDGES: [NodeId, NodeId][] = [
  ["client", "gateway"],
  ["gateway", "auth"],
  ["gateway", "service"],
  ["service", "cache"],
  ["service", "db"],
  ["service", "queue"],
  ["queue", "worker"],
  ["worker", "db"],
];

const edgeKey = (a: NodeId, b: NodeId) => [a, b].sort().join("-");

export default function SystemsLab() {
  const root = useRef<HTMLElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const mobile = useMediaQuery(MQ.mobile);
  const reduced = useMediaQuery(MQ.reduced);
  const layout = mobile ? MOBILE : DESKTOP;

  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(-1);
  const [selected, setSelected] = useState<NodeId>("gateway");

  const current = SCENARIOS[scenario];
  const done = step >= current.steps.length - 1;
  const active = step >= 0 ? current.steps[Math.min(step, current.steps.length - 1)] : null;
  const visited = new Set<string>();
  const touched = new Set<NodeId>();
  current.steps.slice(0, step + 1).forEach((s) => {
    visited.add(edgeKey(s.from, s.to));
    touched.add(s.from).add(s.to);
  });

  const run = useCallback(
    (index: number) => {
      timeline.current?.kill();
      setScenario(index);
      const steps = SCENARIOS[index].steps;

      if (reduced || !dot.current) {
        setStep(steps.length - 1);
        return;
      }

      setStep(-1);
      const tl = gsap.timeline({ delay: 0.15 });
      steps.forEach((s, i) => {
        const a = layout.nodes[s.from as keyof Layout["nodes"]];
        const b = layout.nodes[s.to as keyof Layout["nodes"]];
        tl.call(() => setStep(i))
          .fromTo(
            dot.current,
            { attr: { cx: a.x, cy: a.y }, autoAlpha: 1 },
            { attr: { cx: b.x, cy: b.y }, duration: 0.62, ease: "power2.inOut", immediateRender: false },
          )
          .to({}, { duration: 0.42 });
      });
      tl.to(dot.current, { autoAlpha: 0, duration: 0.3 });
      timeline.current = tl;
    },
    [layout, reduced],
  );

  // Stop a trace that is mid-flight when the layout it was measured for changes.
  useEffect(() => () => void timeline.current?.kill(), [layout]);

  // Play the first trace once, when the diagram is actually on screen.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: `.${styles.diagram}`,
        start: "top 65%",
        once: true,
        onEnter: () => runRef.current(0),
      });
    },
    { scope: root },
  );

  // Keep the current hop visible inside the trace list without moving the page.
  const log = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = log.current;
    const now = list?.children[Math.max(step, 0)] as HTMLElement | undefined;
    if (list && now) list.scrollTo({ top: now.offsetTop - list.clientHeight / 2 + now.clientHeight / 2 });
  }, [step, scenario]);

  const topic = TOPICS[selected];
  const [bw, bh] = layout.box;

  const nodeProps = (id: NodeId) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-pressed": selected === id,
    "aria-label": `${TOPICS[id].label}: ${TOPICS[id].topic}`,
    onClick: () => setSelected(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelected(id);
      }
    },
  });

  return (
    <section ref={root} id="systems" className={`section ${styles.lab}`}>
      <Marker id="systems" note="Interactive" />

      <div className={styles.intro}>
        <h2 className="display" data-rise>
          <span className="mask">
            <span>The systems</span>
          </span>
          <span className="mask">
            <span>
              <em className="serif lime">lab</em>
            </span>
          </span>
        </h2>
        <p data-reveal>
          One request, followed all the way through a typical backend. Pick a scenario to trace it, or select any
          component to see what I pay attention to there. It is a simplified teaching model, not a diagram of a
          specific production system.
        </p>
      </div>

      <div className={styles.picker} role="group" aria-label="Scenario" data-reveal>
        {SCENARIOS.map((s, i) => (
          <button key={s.name} type="button" aria-pressed={scenario === i} onClick={() => run(i)}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s.name}
          </button>
        ))}
      </div>

      <div className={styles.bench}>
        <div className={styles.diagram} data-reveal>
          <svg viewBox={`0 0 ${layout.view[0]} ${layout.view[1]}`} aria-label="Backend architecture diagram">
            {EDGES.map(([a, b]) => {
              const p = layout.nodes[a as keyof Layout["nodes"]];
              const q = layout.nodes[b as keyof Layout["nodes"]];
              const key = edgeKey(a, b);
              const isActive = active && edgeKey(active.from, active.to) === key;
              return (
                <line
                  key={key}
                  x1={p.x}
                  y1={p.y}
                  x2={q.x}
                  y2={q.y}
                  className={styles.edge}
                  data-visited={visited.has(key)}
                  data-active={!!isActive}
                  data-fail={!!isActive && !!active?.fail}
                />
              );
            })}

            <circle ref={dot} r={mobile ? 5 : 6} className={styles.dot} data-fail={!!active?.fail} />

            {(Object.keys(layout.nodes) as (keyof Layout["nodes"])[]).map((id) => {
              const p = layout.nodes[id];
              return (
                <g
                  key={id}
                  className={styles.node}
                  data-selected={selected === id}
                  data-touched={touched.has(id)}
                  data-current={!done && active?.to === id}
                  {...nodeProps(id)}
                >
                  <rect x={p.x - bw / 2} y={p.y - bh / 2} width={bw} height={bh} />
                  <text x={p.x} y={p.y + 4} textAnchor="middle">
                    {TOPICS[id].label}
                  </text>
                </g>
              );
            })}

            <g className={`${styles.node} ${styles.ops}`} data-selected={selected === "ops"} {...nodeProps("ops")}>
              <rect x={layout.ops.x} y={layout.ops.y} width={layout.ops.w} height={layout.ops.h} />
              <text x={layout.ops.x + layout.ops.w / 2} y={layout.ops.y + layout.ops.h / 2 + 4} textAnchor="middle">
                {mobile ? "Deploy · Logs · Metrics · Traces" : "CI/CD · Containers · Logs · Metrics · Traces · Alerts"}
              </text>
            </g>
          </svg>
        </div>

        <div className={styles.side}>
          <div className={styles.trace} data-reveal>
            <p className={styles.request}>
              <span className="mono">Trace</span>
              <code>{current.request}</code>
            </p>
            <ol ref={log}>
              {current.steps.map((s, i) => (
                <li key={i} data-state={i < step ? "past" : i === step ? "now" : "next"} data-fail={!!s.fail}>
                  <span className="mono">
                    {TOPICS[s.from].label} → {TOPICS[s.to].label}
                  </span>
                  {s.text}
                </li>
              ))}
            </ol>
            <p className={styles.result} data-done={done}>
              <span className="mono">Result</span>
              {current.result}
            </p>
            <button type="button" className={styles.replay} onClick={() => run(scenario)}>
              Replay trace
            </button>
          </div>
        </div>
      </div>

      <div className={styles.topic} aria-live="polite" data-reveal>
        <p className="mono">
          <b>{topic.label}</b> Selected component
        </p>
        <h3 key={selected}>{topic.topic}</h3>
        <div key={`${selected}-body`} className={styles.topicBody}>
          <p>{topic.summary}</p>
          <ul>
            {topic.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
