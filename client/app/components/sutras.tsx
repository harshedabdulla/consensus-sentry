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
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-[880px] font-serif text-[48px] leading-[1.12] font-light text-lampblack">
          Grounded in real governance principles.
        </h2>

        <p className="mt-8 max-w-[720px] text-[16px] leading-[1.7] text-steel">
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
            <li
              key={sutra.name}
              className={`rounded-card border border-bone-mist bg-paper-white p-6 transition-colors duration-200 hover:border-fog-line ${
                // The 7th card sits alone on its row, centered.
                i === 6 ? "md:col-start-2" : ""
              }`}
            >
              <p className="text-[11px] font-medium text-slate-pencil">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-[16px] font-medium text-lampblack">
                {sutra.name}
              </h3>
              <p className="mt-3 text-body leading-[1.6] text-steel">
                {sutra.mapping}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
