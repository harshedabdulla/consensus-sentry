import { Reveal } from "./ui/reveal";

const contributions = [
  {
    eyebrow: "empirical",
    heading: "A benchmark for contested topics",
    body: "The same questions, asked across many models.",
    footer: "In development",
  },
  {
    eyebrow: "technical",
    heading: "A verifiable attestation layer",
    body: "A signed record for every guardrail decision.",
    footer: "Planned",
  },
  {
    eyebrow: "institutional",
    heading: "A multi-stakeholder governance model",
    body: "Rules that reveal who authored them.",
    footer: "Planned",
  },
];

export function Contributions() {
  return (
    <section id="contributions" className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-lampblack md:text-[48px]">
          Three contributions.
        </h2>
        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          Three artifacts. One accountability layer.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {contributions.map((card, i) => (
            <Reveal key={card.heading} delay={i * 120} className="h-full">
              <article
                className="group flex h-full flex-col rounded-card border border-bone-mist/70 bg-paper-white px-6 py-8 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-bone-mist hover:shadow-elevated"
              >
                <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil uppercase">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 text-heading-sm font-medium text-lampblack">
                  {card.heading}
                </h3>
                <p className="mt-4 flex-1 text-[13.5px] leading-[1.6] text-steel">
                  {card.body}
                </p>
                <span className="mt-6 inline-flex items-center text-[13px] font-semibold text-violet-ink transition-all group-hover:translate-x-0.5">
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
