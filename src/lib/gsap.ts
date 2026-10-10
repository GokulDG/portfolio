"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Media queries shared by every animation so breakpoints and motion rules stay in one place. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 900px)",
  mobile: "(max-width: 899px)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
