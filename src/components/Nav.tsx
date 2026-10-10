"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/config/portfolio";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SECTIONS } from "@/lib/sections";
import styles from "./Nav.module.css";

const links = SECTIONS.filter((s) => s.nav);

export default function Nav() {
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { availability } = portfolio;

  // Step aside while reading down, come back on the way up.
  useGSAP(() => {
    ScrollTrigger.create({
      start: 120,
      end: "max",
      refreshPriority: -1,
      onUpdate: (self) => bar.current?.classList.toggle(styles.hidden, self.direction === 1),
      onLeaveBack: () => bar.current?.classList.remove(styles.hidden),
    });
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header ref={bar} className={`${styles.nav} ${open ? styles.open : ""}`}>
      <a href="#top" className={styles.brand} aria-label={`${portfolio.name}, back to top`}>
        <span className={styles.mark}>{portfolio.monogram}</span>
        <span className={styles.name}>{portfolio.name}</span>
      </a>

      <p className={styles.status} data-open={availability.open}>
        <i />
        {availability.open ? availability.label : availability.closedLabel}
      </p>

      <nav id="site-menu" className={styles.links} aria-label="Sections">
        <ul>
          {links.map((s, i) => (
            <li key={s.id} style={{ "--i": i } as React.CSSProperties}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                <span>{String(SECTIONS.findIndex((x) => x.id === s.id) + 1).padStart(2, "0")}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
    </header>
  );
}
