"use client";

import { useRef } from "react";
import { portfolio } from "@/config/portfolio";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import Marker from "./Marker";
import styles from "./BuildLog.module.css";

export default function BuildLog() {
  const root = useRef<HTMLElement>(null);
  const steps = portfolio.buildLog;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const list = root.current!.querySelector<HTMLElement>(`.${styles.steps}`)!;
        const items = Array.from(list.children) as HTMLElement[];
        let reached = -1;
        list.classList.add(styles.live);

        // One line is drawn through the steps; each lights up as the line reaches it.
        gsap.fromTo(
          list,
          { "--p": 0 },
          {
            "--p": 1,
            ease: "none",
            scrollTrigger: {
              trigger: list,
              start: "top 78%",
              end: "bottom 60%",
              scrub: 0.5,
              onUpdate: (self) => {
                const next = Math.floor(self.progress * items.length - 0.02);
                if (next === reached) return;
                reached = next;
                items.forEach((el, i) => el.classList.toggle(styles.on, i <= reached));
              },
            },
          },
        );
        return () => list.classList.remove(styles.live);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" className={`section ${styles.log}`}>
      <Marker id="process" note="How I think" />

      <h2 className="display" data-rise>
        <span className="mask">
          <span>The build</span>
        </span>
        <span className="mask">
          <span>
            <em className="serif lime">log</em>
          </span>
        </span>
      </h2>

      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
