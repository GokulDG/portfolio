"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SECTIONS } from "@/lib/sections";
import { useActiveSection } from "@/lib/useActiveSection";
import styles from "./Rail.module.css";

/** A single trace line down the page edge: how far the request has travelled. */
export default function Rail() {
  const fill = useRef<HTMLElement>(null);
  const active = useActiveSection();

  useGSAP(() => {
    gsap.to(fill.current, {
      scaleY: 1,
      ease: "none",
      // Measured after the pinned case study, so "max" includes the space it adds.
      scrollTrigger: { start: 0, end: "max", scrub: 0.3, refreshPriority: -1 },
    });
  });

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
