"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./sections";

/**
 * Index into SECTIONS of the section crossing a line just below mid-screen.
 * An observer stays correct however the page was reached: scroll, jump or anchor.
 */
export function useActiveSection() {
  const [active, setActive] = useState(0);

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

  return active;
}
