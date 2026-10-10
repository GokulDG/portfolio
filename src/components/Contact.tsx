"use client";

import { useRef } from "react";
import { portfolio } from "@/config/portfolio";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FRAME_TARGET, sceneState } from "@/lib/sceneState";
import Marker from "./Marker";
import styles from "./Contact.module.css";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const { contact } = portfolio;

  const resume = contact.resumeUrl
    ? { href: contact.resumeUrl, label: "Resume", note: "PDF", external: true }
    : {
        href: `mailto:${contact.email}?subject=${encodeURIComponent("Resume request")}`,
        label: "Resume",
        note: "On request",
        external: false,
      };

  const links = [
    { href: contact.linkedin, label: "LinkedIn", note: "Profile", external: true },
    { href: contact.github, label: "GitHub", note: "Code", external: true },
    { href: contact.leetcode, label: "LeetCode", note: "Practice", external: true },
    resume,
  ].filter((l) => l.href);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // The closing scene mirrors the opening: every layer folds back into the
      // single interface the page began with, and that frame locks onto the question.
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          sceneState,
          { finale: 0 },
          {
            finale: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 55%", end: "bottom bottom", scrub: 0.6 },
          },
        );
      });

      mm.add(MQ.reduced, () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 60%",
          onEnter: () => (sceneState.finale = 1),
          onLeaveBack: () => (sceneState.finale = 0),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" className={`section ${styles.contact}`}>
      <Marker id="contact" />

      <h2 className={styles.headline} data-rise>
        <span className={styles.frame} {...{ [FRAME_TARGET]: "" }}>
          <span className="mask">
            <span>Have a good</span>
          </span>
          <span className="mask">
            <span>
              <em className="serif lime">problem</em>
            </span>
          </span>
          <span className="mask">
            <span>to solve?</span>
          </span>
        </span>
      </h2>

      <div className={styles.foot}>
        <p className={styles.statement} data-reveal>
          {contact.statement}
        </p>

        <a className={styles.email} href={`mailto:${contact.email}`} data-reveal>
          <span className="mono">Write to me</span>
          <b>{contact.email}</b>
        </a>

        <ul className={styles.links}>
          {links.map((l) => (
            <li key={l.label} data-reveal>
              <a href={l.href} {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                <b>{l.label}</b>
                <span className="mono">{l.note}</span>
                <i aria-hidden="true">↗</i>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
