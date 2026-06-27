import { Reveal } from "./ui/reveal";

const HEADLINE_LINK =
  "text-violet-ink underline decoration-1 underline-offset-[4px] decoration-violet-ink/40 transition-colors hover:decoration-violet-ink";

const sutras = [
  {
    name: "Trust is the Foundation",
    mapping: "Verifiable infrastructure replaces “trust us” with “verify it.”",
  },
  {
    name: "People First",
    mapping: "People affected by AI decisions can inspect and contest them.",
  },
  {
    name: "Innovation over Restraint",
    mapping: "Auditability enables deployment, not just restriction.",
  },
  {
    name: "Fairness & Equity",
    mapping: "Diverse-panel ruleset authoring with declared composition.",
  },
  {
    name: "Accountability",
    mapping:
      "Every decision carries a cryptographic record of who, what, when, why.",
  },
  {
    name: "Understandable by Design",
    mapping:
      "Rules are versioned, authored, and inspectable as primary artifacts.",
  },
  {
    name: "Safety, Resilience & Sustainability",
    mapping: "External audit makes safety claims falsifiable.",
  },
];

export function Sutras() {
  return (
    <section id="principles" className="px-6 pt-28 md:pt-40">
      {/* Editorial 2-column (DESIGN.md): display heading + intro pinned on the
          left, the seven principles as a reading-first numbered list on the
          right - hairline dividers, not a card grid. */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="max-w-[440px] font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-balance text-lampblack md:text-[48px]">
              Grounded in real{" "}
              <a href="#contributions" className={HEADLINE_LINK}>
                governance principles
              </a>
              .
            </h2>

            <p className="mt-6 max-w-[420px] text-[15px] leading-[1.65] text-steel">
              The mechanism is framework-agnostic, but it has to map onto
              principles someone has actually written down. India&rsquo;s AI
              Governance Guidelines (MeitY, November 2025) set out seven. Below
              is one concrete mapping: how a deployer could demonstrate, in an
              externally verifiable way, that each is being applied. Other
              frameworks map the same way.
            </p>
          </div>
        </div>

        <ol className="lg:col-span-7">
          {sutras.map((sutra, i) => (
            <Reveal key={sutra.name} delay={i * 50}>
              <li
                className={`group grid grid-cols-[auto_1fr] gap-x-5 py-6 transition-colors ${
                  i === 0 ? "" : "border-t border-bone-mist/60"
                }`}
              >
                <span className="pt-0.5 font-mono text-[13px] font-semibold text-slate-pencil transition-colors group-hover:text-design-hudson-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-lampblack">
                    {sutra.name}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.6] text-steel">
                    {sutra.mapping}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
