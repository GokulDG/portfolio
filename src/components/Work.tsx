"use client";

import { useRef, useState } from "react";
import { portfolio, type Project } from "@/config/portfolio";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import Marker from "./Marker";
import ProjectVisual from "./ProjectVisual";
import styles from "./Work.module.css";

const KIND: Record<Project["kind"], string> = {
  professional: "Professional work",
  client: "Client project",
  personal: "Personal project",
};

function Links({ links }: { links: Project["links"] }) {
  if (!links.live && !links.repo) return null;
  return (
    <p className={styles.links}>
      {links.live && (
        <a className="link" href={links.live} target="_blank" rel="noreferrer">
          Visit live site <span aria-hidden="true">↗</span>
        </a>
      )}
      {links.repo && (
        <a className="link" href={links.repo} target="_blank" rel="noreferrer">
          Source <span aria-hidden="true">↗</span>
        </a>
      )}
    </p>
  );
}

function Stack({ stack }: { stack: string[] }) {
  if (!stack.length) return null;
  return (
    <ul className={styles.stack} aria-label="Technologies">
      {stack.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Outcomes({ project }: { project: Project }) {
  if (!project.outcomes.length) return null;
  return (
    <dl className={styles.outcomes}>
      {project.outcomes.map((o) => (
        <div key={o.label} data-reveal>
          <dt>{o.value}</dt>
          <dd>{o.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function CaseHead({ project, index }: { project: Project; index: number }) {
  return (
    <header className={styles.head}>
      <p className={`${styles.kind} mono`} data-reveal>
        <b>{String(index + 1).padStart(2, "0")}</b>
        <span>{KIND[project.kind]}</span>
        <span>{project.context}</span>
        {project.period && <span>{project.period}</span>}
      </p>
      <h3 className={styles.title} data-title>
        {project.name}
      </h3>
      <p className={styles.tagline} data-reveal>
        {project.tagline}
      </p>
    </header>
  );
}

function Notes({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.note} data-reveal>
        <h4 className="mono">The problem</h4>
        <p className={styles.lead}>{project.problem}</p>
      </div>
      <div className={styles.note} data-reveal>
        <h4 className="mono">My part · {project.role}</h4>
        <ul className={styles.list}>
          {project.contribution.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <div className={styles.note} data-reveal>
        <h4 className="mono">How it works</h4>
        <p>{project.architecture}</p>
      </div>
    </>
  );
}

/** Case study with a sticky working model beside the narrative. */
function SplitCase({ project, index }: { project: Project; index: number }) {
  return (
    <article className={styles.case}>
      <CaseHead project={project} index={index} />
      <div className={styles.split}>
        <div className={styles.sticky} data-reveal>
          <ProjectVisual kind={project.visual} label={project.name} />
        </div>
        <div className={styles.narrative}>
          <Notes project={project} />
          <Outcomes project={project} />
          <Stack stack={project.stack} />
          <Links links={project.links} />
        </div>
      </div>
    </article>
  );
}

/** Case study told left to right, following a signal through the system. */
function SignalCase({ project, index }: { project: Project; index: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MQ.desktop} and ${MQ.motion}`, () => {
        const wrap = root.current!.querySelector<HTMLElement>(`.${styles.path}`)!;
        const track = wrap.querySelector<HTMLElement>(`.${styles.track}`)!;
        const distance = () => track.scrollWidth - wrap.clientWidth;
        // Switch to the full-height stage before anything is measured.
        wrap.classList.add(styles.pinned);

        // Pinned for exactly the distance it travels, so scroll speed never changes.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(track, { x: () => -distance() }, 0)
          .fromTo(`.${styles.trace} i`, { scaleX: 0 }, { scaleX: 1 }, 0);

        return () => wrap.classList.remove(styles.pinned);
      });
    },
    { scope: root },
  );

  return (
    <article ref={root} className={styles.case}>
      <CaseHead project={project} index={index} />

      <div className={styles.brief}>
        <div className={styles.note} data-reveal>
          <h4 className="mono">The problem</h4>
          <p className={styles.lead}>{project.problem}</p>
        </div>
        <div data-reveal>
          <ProjectVisual kind={project.visual} label={project.name} />
        </div>
      </div>

      <div className={styles.path}>
        <div className={styles.pathHead}>
          <p className="mono">
            <b>Signal path</b>
            <span>{project.name}</span>
          </p>
          <p className={styles.pathTitle}>One alarm, from the panel to a person.</p>
          <p className="mono">{String(project.signalPath!.length).padStart(2, "0")} stages</p>
        </div>
        <ol className={styles.track}>
          <li className={styles.trace} aria-hidden="true">
            <i />
          </li>
          {project.signalPath!.map((stage) => (
            <li key={stage.code} className={styles.stage}>
              <span className={styles.numeral} aria-hidden="true">
                {stage.code}
              </span>
              <h4>{stage.title}</h4>
              <p>{stage.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.after}>
        <div className={styles.narrative}>
          <div className={styles.note} data-reveal>
            <h4 className="mono">My part · {project.role}</h4>
            <ul className={styles.list}>
              {project.contribution.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <Stack stack={project.stack} />
          <Links links={project.links} />
        </div>
        <Outcomes project={project} />
      </div>
    </article>
  );
}

/** Remaining projects as an editorial index. Hover previews, click to open. */
function ProjectIndex({ projects, offset }: { projects: Project[]; offset: number }) {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<Project | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const x = gsap.quickTo(preview.current, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(preview.current, "y", { duration: 0.6, ease: "power3" });
        const move = (e: PointerEvent) => {
          x(e.clientX);
          y(e.clientY);
        };
        const el = list.current!;
        el.addEventListener("pointermove", move);
        return () => el.removeEventListener("pointermove", move);
      });
    },
    { scope: list },
  );

  return (
    <div className={styles.index}>
      <p className={`${styles.indexHead} mono`} data-reveal>
        <span>Personal builds</span>
        <span>Designed and built on my own time</span>
      </p>

      <ul ref={list} onPointerLeave={() => setHover(null)}>
        {projects.map((p, i) => {
          const isOpen = open === p.id;
          return (
            <li key={p.id} className={styles.row} data-open={isOpen} data-reveal>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`project-${p.id}`}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  onPointerEnter={() => setHover(p)}
                >
                  <span className="mono">{String(offset + i + 1).padStart(2, "0")}</span>
                  <span className={styles.rowName}>{p.name}</span>
                  <span className={styles.rowTag}>{p.tagline}</span>
                  <span className="mono">{p.period}</span>
                  <span className={styles.plus} aria-hidden="true" />
                </button>
              </h3>
              <div id={`project-${p.id}`} className={styles.panel} inert={!isOpen}>
                <div className={styles.panelInner}>
                  <div className={styles.panelVisual}>
                    <ProjectVisual kind={p.visual} label={p.name} />
                  </div>
                  <div className={styles.narrative}>
                    <Notes project={p} />
                    <Stack stack={p.stack} />
                    <Links links={p.links} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div ref={preview} className={styles.preview} data-show={!!hover && open !== hover.id} aria-hidden="true">
        {hover && <ProjectVisual kind={hover.visual} label={hover.name} />}
      </div>
    </div>
  );
}

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const featured = portfolio.projects.slice(0, 2);
  const rest = portfolio.projects.slice(2);

  // Oversized titles drift against the scroll, alternating direction.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-title]").forEach((title, i) => {
          const dir = i % 2 ? 1 : -1;
          gsap.fromTo(
            title,
            { xPercent: -5 * dir },
            {
              xPercent: 5 * dir,
              ease: "none",
              scrollTrigger: { trigger: title, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className={`section ${styles.work}`}>
      <Marker id="work" note={`${portfolio.projects.length} projects`} />
      <h2 className="display" data-rise>
        <span className="mask">
          <span>Project</span>
        </span>
        <span className="mask">
          <span>
            <em className="serif lime">worlds</em>
          </span>
        </span>
      </h2>

      {featured.map((p, i) =>
        p.signalPath ? <SignalCase key={p.id} project={p} index={i} /> : <SplitCase key={p.id} project={p} index={i} />,
      )}

      <ProjectIndex projects={rest} offset={featured.length} />

      {portfolio.experiments.length > 0 && (
        <div className={styles.experiments}>
          <p className="mono" data-reveal>
            Smaller experiments
          </p>
          <ul>
            {portfolio.experiments.map((e) => (
              <li key={e.name} data-reveal>
                <h3>
                  {e.link ? (
                    <a className="link" href={e.link} target="_blank" rel="noreferrer">
                      {e.name}
                    </a>
                  ) : (
                    e.name
                  )}
                </h3>
                <p>{e.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
