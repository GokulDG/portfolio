"use client";

import { useRef } from "react";
import { portfolio } from "@/config/portfolio";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import Marker from "./Marker";
import styles from "./Story.module.css";

export default function Story() {
  const root = useRef<HTMLElement>(null);
  const { story } = portfolio;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // The sentence is read at the pace it is scrolled.
        gsap.fromTo(
          `.${styles.statement} span`,
          { opacity: 0.13 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: `.${styles.statement}`, start: "top 80%", end: "bottom 48%", scrub: 0.4 },
          },
        );

        // The stack finishes its exit as the detail begins.
        gsap.fromTo(
          sceneState,
          { veil: 1 },
          {
            veil: 0,
            ease: "none",
            scrollTrigger: { trigger: `.${styles.grid}`, start: "top 100%", end: "top 55%", scrub: true },
          },
        );

        const list = root.current!.querySelector(`.${styles.mindset}`)!;
        list.classList.add(styles.live);
        gsap.utils.toArray<HTMLElement>(`.${styles.mindset} li`).forEach((row) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top 64%",
            end: "bottom 64%",
            toggleClass: { targets: row, className: styles.on },
          });
        });
        return () => list.classList.remove(styles.live);
      });

      mm.add(MQ.reduced, () => {
        ScrollTrigger.create({
          trigger: `.${styles.grid}`,
          start: "top 80%",
          onEnter: () => (sceneState.veil = 0),
          onLeaveBack: () => (sceneState.veil = 1),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="story" className={`section ${styles.story}`}>
      <Marker id="story" />

      <p className={styles.statement}>
        {story.statement.split(" ").map((word, i) => (
          <span key={i}>{word} </span>
        ))}
      </p>

      <div className={styles.grid}>
        <div className={styles.intro}>
          {story.intro.map((p, i) => (
            <p key={i} data-reveal>
              {p}
            </p>
          ))}
          <dl className={styles.facts} data-reveal>
            {story.facts.map((f) => (
              <div key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className={styles.mindset}>
          {story.mindset.map((m, i) => (
            <li key={m.title}>
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
