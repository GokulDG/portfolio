"use client";

import { useRef } from "react";
import { portfolio } from "@/config/portfolio";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import styles from "./Hero.module.css";

/** Where the stack sits in the first viewport, per layout. */
const POSE = {
  desktop: { x: 0.34, y: -0.04, scale: 1, opacity: 1 },
  mobile: { x: 0.04, y: 0.36, scale: 1.9, opacity: 0.85 },
};

/** Words rise individually; the two break sets give three lines on desktop and four on mobile. */
const HEADLINE: ({ text: string; accent?: boolean } | "wide" | "narrow" | "both")[] = [
  { text: "I" },
  { text: "build" },
  { text: "the" },
  "both",
  { text: "systems" },
  "narrow",
  { text: "behind", accent: true },
  "wide",
  { text: "the" },
  "narrow",
  { text: "experience." },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const build = (pose: (typeof POSE)["desktop"], animate: boolean) => {
        const from = { tilt: 1, explode: 0.6, spin: 0, labels: 1, ...pose };
        Object.assign(sceneState, from);
        if (!animate) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });

        // The camera pushes into the stack: layers spread, turn and pass behind the story.
        tl.fromTo(
          sceneState,
          { ...from },
          { x: 0, y: 0, explode: 2, spin: 0.9, scale: pose.scale * 2.1, opacity: 0.22, labels: 0 },
          0,
        )
          // The copy holds its shape and falls behind as one piece, slower than the page.
          .to(`.${styles.inner}`, { yPercent: 16, ease: "none" }, 0)
          .to(`.${styles.inner}`, { autoAlpha: 0, ease: "power1.in", duration: 0.5 }, 0.15);
      };

      mm.add(`${MQ.desktop} and ${MQ.motion}`, () => build(POSE.desktop, true));
      mm.add(`${MQ.mobile} and ${MQ.motion}`, () => build(POSE.mobile, true));
      mm.add(`${MQ.desktop} and ${MQ.reduced}`, () => build(POSE.desktop, false));
      mm.add(`${MQ.mobile} and ${MQ.reduced}`, () => build(POSE.mobile, false));
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className={styles.hero}>
      <div className={styles.inner}>
        <p className={`${styles.kicker} mono`}>
          <span>Beyond the interface</span>
          <span>{portfolio.coordinates}</span>
        </p>

        <h1 className={styles.headline} aria-label="I build the systems behind the experience.">
          {HEADLINE.map((part, i) =>
            typeof part === "string" ? (
              <br key={i} className={styles[part]} />
            ) : (
              <span key={i} className={styles.word} aria-hidden="true">
                <span style={{ "--i": i } as React.CSSProperties}>
                  {part.accent ? <em className="serif lime">{part.text}</em> : part.text}
                </span>
              </span>
            ),
          )}
        </h1>

        <div className={styles.foot}>
          <p className={styles.statement}>{portfolio.hero.statement}</p>
          <dl className={`${styles.id} mono`}>
            <div>
              <dt>Name</dt>
              <dd>{portfolio.name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{portfolio.role}</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{portfolio.location}</dd>
            </div>
          </dl>
          <a href="#story" className={`${styles.scroll} mono`}>
            Scroll
            <i />
          </a>
        </div>
      </div>
    </section>
  );
}
