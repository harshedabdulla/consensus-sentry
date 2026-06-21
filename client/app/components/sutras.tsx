import { Reveal } from "./ui/reveal";

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
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-[880px] font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-lampblack md:text-[48px]">
          Grounded in real{" "}
          <a
            href="#contributions"
            className="text-violet-ink underline decoration-1 underline-offset-[4px] decoration-violet-ink/40 transition-colors hover:decoration-violet-ink"
          >
            governance principles
          </a>
          .
        </h2>

        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          The mechanism is framework-agnostic, but it has to map onto principles
          someone has actually written down. India&rsquo;s AI Governance
          Guidelines (MeitY, November 2025) set out seven: Trust, People First,
          Innovation over Restraint, Fairness &amp; Equity, Accountability,
          Understandable by Design, Safety &amp; Resilience.
          Below is one concrete mapping: how a deployer could demonstrate, in an
          externally verifiable way, that each is being applied. Other frameworks
          map the same way.
        </p>

        <ol className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {sutras.map((sutra, i) => (
            <Reveal
              key={sutra.name}
              delay={i * 60}
              className={`h-full ${
                // The 7th card sits alone on its row, centered.
                i === 6 ? "md:col-start-2" : ""
              }`}
            >
              <li
                className="group flex h-full flex-col rounded-card border border-bone-mist/60 bg-paper-white p-6 shadow-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-bone-mist/90 hover:shadow-elevated"
              >
                <p className="text-[11px] font-semibold text-slate-pencil transition-colors group-hover:text-design-hudson-blue">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-[15px] font-semibold text-lampblack">
                  {sutra.name}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-steel">
                  {sutra.mapping}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
