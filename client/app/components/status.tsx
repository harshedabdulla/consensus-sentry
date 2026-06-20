import { StatusTag, type Tone } from "./ui/status-tag";

type Phase = {
  label: string;
  description: string;
  status: string;
  tone: Tone;
};

const phases: Phase[] = [
  {
    label: "Phase 01",
    description: "Research statement and landing page",
    status: "In progress",
    tone: {
      dot: "var(--color-carbon-black)",
      label: "var(--color-lampblack)",
      weight: 500,
    },
  },
  {
    label: "Phase 02",
    description: "Empirical benchmark of contested topics",
    status: "Design",
    tone: {
      dot: "var(--color-slate-pencil)",
      label: "var(--color-steel)",
      weight: 400,
    },
  },
  {
    label: "Phase 03",
    description: "Attestation layer reference implementation",
    status: "Planned",
    tone: {
      dot: "var(--color-fog-line)",
      label: "var(--color-slate-pencil)",
      weight: 400,
    },
  },
  {
    label: "Phase 04",
    description: "Pilot deployment and independent audit",
    status: "Future",
    tone: {
      dot: "var(--color-fog-line)",
      label: "var(--color-slate-pencil)",
      weight: 400,
    },
  },
];

export function Status() {
  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[720px]">
        <h2 className="font-serif text-[48px] leading-[1.12] font-light text-lampblack">
          Where we are.
        </h2>
        <p className="mt-6 text-[16px] leading-[1.7] text-steel">
          Early-stage research. We are publishing as we go.
        </p>

        <div className="mt-12">
          {phases.map((phase) => (
            <div
              key={phase.label}
              className="flex items-center gap-6 border-b border-bone-mist py-5 transition-colors duration-200 hover:bg-paper-white"
            >
              <span className="font-mono text-[13px] font-medium text-slate-pencil">
                {phase.label}
              </span>
              <span className="flex-1 text-[15px] text-lampblack">
                {phase.description}
              </span>
              <StatusTag label={phase.status} tone={phase.tone} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
