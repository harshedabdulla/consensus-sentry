"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ParallaxBgProps = {
  src: string;
  /**
   * Vertical drift, in % of the layer height, applied in EACH direction as the
   * section scrolls through the viewport. Kept well under the 12.5% of slack
   * that the scale-125 zoom buys us, so the painting never reveals an edge.
   */
  amount?: number;
  className?: string;
};

/**
 * A full-bleed painted background layer that drifts slower than the page on
 * scroll, so the frosted card over it reads as floating above a real tableau
 * (DESIGN.md). The layer is zoomed (scale-125 via the CSS `scale` property) to
 * create slack, and only `transform` (translateY via yPercent) is animated, so
 * the effect stays on the compositor. Disabled under prefers-reduced-motion.
 *
 * Drop it in as the first child of a `relative overflow-hidden` section; it
 * sizes to that parent.
 */
export function ParallaxBg({ src, amount = 8, className = "" }: ParallaxBgProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const section = el?.parentElement;
      if (!el || !section) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 scale-125 bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url('${src}')`, willChange: "transform" }}
    />
  );
}
