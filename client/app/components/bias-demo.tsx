"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { biasExamples } from "@/content/bias-examples";
import { StatusTag } from "./ui/status-tag";

export function BiasDemo() {
  const [index, setIndex] = useState(0);
  const selectId = useId();
  const active = biasExamples[index];

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

        <div className="mt-10 max-w-[560px]">
          <label htmlFor={selectId} className="sr-only">
            Choose a contested query
          </label>
          <div className="relative">
            <select
              id={selectId}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="w-full cursor-pointer appearance-none rounded-tag border-[1.5px] border-lampblack bg-paper-white px-4 py-3 pr-11 text-[16px] text-lampblack transition-colors hover:bg-bone-mist"
            >
              {biasExamples.map((example, i) => (
                <option key={example.query} value={i}>
                  {example.query}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-steel"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {active.responses.map((response, i) => (
            <article
              // Keying on the active query remounts each card so it fades in
              // when the selection changes — the only motion the demo carries.
              key={`${index}-${response.model}`}
              style={{ animationDelay: `${i * 60}ms` }}
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
