import { Reveal } from "./ui/reveal";

const contributions = [
  {
    eyebrow: "empirical",
    heading: "A benchmark for contested topics",
    body: "50 to 100 prompts across territorial disputes, religious history, social issues, and regional language coverage, evaluated across major language models. Built to surface and quantify refusal asymmetries that current moderation cannot account for.",
    footer: "In development",
  },
  {
    eyebrow: "technical",
    heading: "A verifiable attestation layer",
    body: "Every guardrail decision carries a signed record of which rule was applied, what version, to which input, with what rationale. Any party can verify cryptographically what actually happened. Designed to extend existing open-source guardrail frameworks, not replace them.",
    footer: "Planned",
  },
  {
    eyebrow: "institutional",
    heading: "A multi-stakeholder governance model",
    body: "Rulesets authored by chartered review panels with declared diverse backgrounds: legal, ethics, regional and linguistic representation, civil society, technical experts. Not citizen voting on ethics. Constitutional process with verifiable transparency.",
    footer: "Planned",
  },
];

export function Contributions() {
  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-serif text-[42px] leading-[1.10] font-light text-lampblack md:text-[48px]">
          Three contributions.
        </h2>
        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          The project has three deliverables, sequenced. Each stands on its own.
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
