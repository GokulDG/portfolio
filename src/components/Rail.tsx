"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SECTIONS } from "@/lib/sections";
import styles from "./Rail.module.css";

/** A single trace line down the page edge: how far the request has travelled. */
export default function Rail() {
  const fill = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    gsap.to(fill.current, {
      scaleY: 1,
      ease: "none",
      // Measured after the pinned case study, so "max" includes the space it adds.
      scrollTrigger: { start: 0, end: "max", scrub: 0.3, refreshPriority: -1 },
    });
  });

  // The current section is whichever one crosses a line just below mid-screen.
  // An observer stays correct however the page was reached: scroll, jump or anchor.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(SECTIONS.findIndex((s) => s.id === hit.target.id));
      },
      { rootMargin: "-55% 0px -45% 0px" },
    );
    SECTIONS.forEach((s) => observer.observe(document.getElementById(s.id)!));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.rail} aria-hidden="true">
      <span className={styles.track}>
        <i ref={fill} />
      </span>
      <span className={styles.readout}>
        <b>{String(active + 1).padStart(2, "0")}</b>
        <span>/ {String(SECTIONS.length).padStart(2, "0")}</span>
        <em key={active}>{SECTIONS[active].label}</em>
      </span>
    </div>
  );
}
