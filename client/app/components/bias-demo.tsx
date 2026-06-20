"use client";

import { useEffect, useRef, useState } from "react";
import { biasExamples } from "@/content/bias-examples";
import { StatusTag } from "./ui/status-tag";

export function BiasDemo() {
  const [index, setIndex] = useState(0);
  const active = biasExamples[index];

  // Sliding "thumb" behind the active topic. We measure the active button's
  // box and animate the thumb's left/width to it — the signature interaction.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[index];
      if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    // Re-measure once the webfont swaps in, since button widths shift.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [index]);

  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h3 className="text-heading-sm font-medium text-lampblack">
          What the gap looks like.
        </h3>
        <p className="mt-3 max-w-[720px] text-body leading-[1.6] text-steel">
          Pick a contested query and compare how three production language models
          respond. Same question, different treatment, with no record of why.
        </p>

        {/* Animated segmented selector */}
        <div
          role="tablist"
          aria-label="Contested queries"
          className="relative mt-10 inline-flex max-w-full snap-x gap-1 overflow-x-auto rounded-pill border border-fog-line bg-paper-white p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <span
            aria-hidden="true"
            style={{
              left: thumb?.left ?? 0,
              width: thumb?.width ?? 0,
              opacity: thumb ? 1 : 0,
            }}
            className="absolute top-1 bottom-1 z-0 rounded-pill bg-carbon-black transition-[left,width,opacity] duration-300 ease-out motion-reduce:transition-none"
          />
          {biasExamples.map((example, i) => {
            const selected = i === index;
            return (
              <button
                key={example.topic}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                aria-selected={selected}
                onClick={() => setIndex(i)}
                className={`relative z-10 snap-start rounded-pill px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
                  selected
                    ? "text-paper-white"
                    : "text-steel hover:text-lampblack"
                }`}
              >
                {example.topic}
              </button>
            );
          })}
        </div>

        {/* The full query, echoed as an editorial pull-quote */}
        <p className="mt-8 text-caption font-medium tracking-[0.05em] text-slate-pencil">
          Selected query
        </p>
        <p
          key={index}
          className="cs-fade-in mt-2 max-w-[820px] font-serif text-[24px] leading-[1.25] font-light text-lampblack md:text-[28px]"
        >
          {active.query}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {active.responses.map((response, i) => (
            <article
              // Keying on the active query remounts each card so it fades in
              // when the selection changes, staggered left to right.
              key={`${index}-${response.model}`}
              style={{ animationDelay: `${i * 70}ms` }}
              className="cs-fade-in rounded-card bg-paper-white p-6 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="text-[13px] font-medium text-lampblack">
                {response.model}
              </div>
              <div className="mt-2">
                <StatusTag variant={response.status} />
              </div>
              <hr className="my-4 border-0 border-t border-bone-mist" />
              <p className="text-body leading-[1.6] text-lampblack">
                {response.text}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-6 max-w-[720px] text-caption text-slate-pencil">
          Responses sampled in October 2025. Refusal asymmetries documented in
          BorderLines (2024) and ToxiGen (2024). Full benchmark in development.
        </p>
      </div>
    </section>
  );
}
