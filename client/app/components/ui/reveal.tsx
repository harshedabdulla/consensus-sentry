"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms, applied once the element enters the viewport. */
  delay?: number;
  className?: string;
};

/**
 * Reveals its children with a quiet fade-and-rise the first time they scroll
 * into view — the single sanctioned scroll animation (see CLAUDE.md). Motion is
 * expressed only through Tailwind `motion-safe:` variants, so users who prefer
 * reduced motion get the content immediately, fully visible, with no transform.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion needs no special-casing: the hidden state below is
    // expressed purely through `motion-safe:` variants, so when motion is
    // reduced the content is fully visible regardless of `shown`.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: shown ? `${delay}ms` : "0ms",
        transitionProperty: "opacity, transform",
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`motion-safe:transition-all ${
        shown
          ? "opacity-100 motion-safe:translate-y-0"
          : "motion-safe:translate-y-6 motion-safe:opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
