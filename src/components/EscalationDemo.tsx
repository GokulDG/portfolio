"use client";

import { useEffect, useRef, useState } from "react";
import { MQ } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./EscalationDemo.module.css";

const LEVELS = 3;
type Status = "running" | "acknowledged" | "exhausted";

/**
 * A working model of multi-level escalation: a timer runs at each level and,
 * if nobody acknowledges, the ticket moves up. It illustrates the idea and is
 * deliberately not a copy of the product's interface.
 */
export default function EscalationDemo() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery(MQ.reduced);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<Status>("running");
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  // After an outcome, pause on it, then start a fresh ticket.
  useEffect(() => {
    if (status === "running") return;
    const id = setTimeout(() => {
      setLevel(0);
      setStatus("running");
    }, 2600);
    return () => clearTimeout(id);
  }, [status]);

  const onTimerEnd = () => {
    if (level < LEVELS - 1) setLevel(level + 1);
    else setStatus("exhausted");
  };

  const message =
    status === "acknowledged"
      ? `Acknowledged at level ${level + 1}. Follow-ups stop here.`
      : status === "exhausted"
        ? "Nobody responded. Every level has been notified."
        : `Level ${level + 1} notified. Timer running.`;

  return (
    <div ref={root} className={styles.demo} data-paused={!inView}>
      <p className="mono">Working model · not the product UI</p>

      <ol className={styles.ladder}>
        {Array.from({ length: LEVELS }, (_, i) => {
          const state = reduced ? "static" : i < level ? "passed" : i === level ? status : "idle";
          return (
            <li key={i} data-state={state} style={{ "--step": i } as React.CSSProperties}>
              <span className="mono">L{i + 1}</span>
              <b>Level {i + 1}</b>
              <em className="mono">
                {state === "passed" && "No response · escalated"}
                {state === "running" && "Notified · timer running"}
                {state === "acknowledged" && "Acknowledged"}
                {state === "exhausted" && "No response"}
                {state === "idle" && "Standing by"}
                {state === "static" && (i === 0 ? "First to be notified" : "Notified if the level below is silent")}
              </em>
              {state === "running" && <i key={`${i}-${status}`} onAnimationEnd={onTimerEnd} />}
            </li>
          );
        })}
      </ol>

      {!reduced && (
        <div className={styles.controls}>
          <button type="button" onClick={() => setStatus("acknowledged")} disabled={status !== "running"}>
            Acknowledge
          </button>
          <p aria-live="polite">{message}</p>
        </div>
      )}
    </div>
  );
}
