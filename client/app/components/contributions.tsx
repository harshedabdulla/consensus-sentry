import { Reveal } from "./ui/reveal";

const contributions = [
  {
    eyebrow: "empirical",
    heading: "A benchmark for contested topics",
    body: "The same questions, asked across many models — so disagreement becomes measurable instead of anecdotal.",
    footer: "In development",
  },
  {
    eyebrow: "technical",
    heading: "A verifiable attestation layer",
    body: "A signed record for every guardrail decision: which rule fired, who authored it, and when.",
    footer: "Planned",
  },
  {
    eyebrow: "institutional",
    heading: "A multi-stakeholder governance model",
    body: "Rules that reveal who authored them, so authorship can be audited and contested.",
    footer: "Planned",
  },
];

export function Contributions() {
  return (
    <section id="contributions" className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil uppercase">
          The work
        </p>
        <h2 className="mt-4 font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-balance text-lampblack md:text-[48px]">
          Three contributions.
        </h2>
        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          Three artifacts. One accountability layer.
        </p>

        {/* Full-width editorial rows with large serif numerals (DESIGN.md
            reading-first layout) — deliberately unlike the principles list and
            the status rows so no two sections repeat the same card pattern. */}
        <div className="mt-14 flex flex-col">
          {contributions.map((card, i) => (
            <Reveal key={card.heading} delay={i * 100}>
              <article
                className={`group grid grid-cols-1 gap-y-4 py-8 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-x-12 md:py-10 ${
                  i === 0 ? "" : "border-t border-bone-mist/70"
                }`}
              >
                <span className="font-serif text-[40px] font-light leading-none text-bone-mist transition-colors duration-300 group-hover:text-design-hudson-blue md:text-[52px]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="md:max-w-[520px]">
                  <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil uppercase">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-2 text-[22px] font-medium leading-[1.2] text-lampblack">
                    {card.heading}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-steel">
                    {card.body}
                  </p>
                </div>

                <span className="text-[13px] font-semibold text-violet-ink md:text-right">
                  {card.footer}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
