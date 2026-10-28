"use client";

import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/config/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SECTIONS } from "@/lib/sections";
import { useActiveSection } from "@/lib/useActiveSection";
import styles from "./Nav.module.css";

const links = SECTIONS.filter((s) => s.nav);
const num = (i: number) => String(i + 1).padStart(2, "0");

export default function Nav() {
  const bar = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const active = useActiveSection();
  const { availability, contact } = portfolio;

  useGSAP(() => {
    // Step aside while reading down, come back on the way up.
    ScrollTrigger.create({
      start: 120,
      end: "max",
      refreshPriority: -1,
      onUpdate: (self) => bar.current?.classList.toggle(styles.hidden, self.direction === 1),
      onLeaveBack: () => bar.current?.classList.remove(styles.hidden),
    });
    // Once content runs underneath, the bar needs its own backdrop.
    ScrollTrigger.create({
      start: 40,
      end: "max",
      onToggle: (self) => bar.current?.classList.toggle(styles.scrolled, self.isActive),
    });
    // Mobile stands in for the rail: a hairline along the bar's bottom edge.
    gsap.to(progress.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3, refreshPriority: -1 },
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

  // Client only, so the server render never disagrees about the minute.
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: portfolio.timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

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

      <p className={styles.readout} aria-hidden="true">
        <b>{num(active)}</b>
        <span>/ {String(SECTIONS.length).padStart(2, "0")}</span>
        <em key={active}>{SECTIONS[active].label}</em>
      </p>

      <nav id="site-menu" className={styles.links} aria-label="Sections">
        <span key={active} className={styles.ghost} aria-hidden="true">
          {num(active)}
        </span>

        <p className={styles.menuMeta}>
          <span>Index</span>
          <span>{String(links.length).padStart(2, "0")} sections</span>
        </p>

        <ul>
          {links.map((s, i) => {
            const index = SECTIONS.findIndex((x) => x.id === s.id);
            const current = index === active;
            return (
              <li key={s.id} style={{ "--i": i } as React.CSSProperties} className={current ? styles.current : undefined}>
                <a href={`#${s.id}`} aria-current={current ? "location" : undefined} onClick={() => setOpen(false)}>
                  <span className={styles.num}>{num(index)}</span>
                  <span className={styles.label}>
                    <span>{s.label}</span>
                  </span>
                  <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 13 13 3M5 3h8v8" />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>

        <div className={styles.menuFoot}>
          <p className={styles.wide}>
            <span>Status</span>
            <b data-open={availability.open}>
              <i />
              {availability.open ? availability.label : availability.closedLabel}
            </b>
          </p>
          <p>
            <span>Local time</span>
            <b>{time ?? "--:--"}</b>
          </p>
          <p>
            <span>Based in</span>
            <b>{portfolio.location}</b>
          </p>
          <p className={`${styles.wide} ${styles.socials}`}>
            <a href={`mailto:${contact.email}`}>Email</a>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </nav>

      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.burger} aria-hidden="true">
          <i />
          <i />
        </span>
        {open ? "Close" : "Menu"}
      </button>

      <span ref={progress} className={styles.progress} aria-hidden="true" />
    </header>
  );
}
