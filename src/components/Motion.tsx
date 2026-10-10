"use client";

import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The page's two entrance animations, declared once.
 *
 *   data-rise    a group of `.mask > span` lines that rise from the baseline
 *   data-reveal  a block that fades up; neighbours entering together stagger
 *
 * Initial states are set here, in JS, so the page is fully readable if this
 * never runs. Reduced-motion users skip both.
 */
export default function Motion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((group) => {
        gsap.from(group.querySelectorAll(".mask > span"), {
          yPercent: 108,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
        });
      });

      gsap.set("[data-reveal]", { autoAlpha: 0, y: 26 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        // The stagger is capped: jumping down the page (End key, an anchor link)
        // enters dozens of blocks at once and none of them should wait seconds.
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: { amount: Math.min(0.35, els.length * 0.07) },
            overwrite: true,
          }),
      });
    });

    // This component mounts last, so every trigger on the page exists by now.
    // Sorting puts them in document order, which lets triggers created before
    // the pinned case study account for the space that pin adds.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    // Fonts loading, accordions opening and layout swaps all change the page
    // height, which moves every trigger below them. Re-measure when it settles.
    let height = document.body.offsetHeight;
    const refresh = gsap.delayedCall(0.3, () => ScrollTrigger.refresh()).pause();
    const observer = new ResizeObserver(() => {
      if (Math.abs(document.body.offsetHeight - height) < 4) return;
      height = document.body.offsetHeight;
      refresh.restart(true);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      refresh.kill();
    };
  });

  return null;
}
