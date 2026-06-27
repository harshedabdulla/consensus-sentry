// Semantic state tags. The palette stays quiet everywhere else, so the warm
// colors are reserved for these tiny model-behavior signals.

export type BiasVariant = "refused" | "hedged" | "answered";

export type Tone = {
  /** Dot color - a CSS color, typically a var(--color-*). */
  dot: string;
  /** Label color - a CSS color, typically a var(--color-*). */
  label: string;
  /** Font weight for the label. */
  weight: number;
};

// The three bias-demo states.
const BIAS_TONES: Record<BiasVariant, Tone> = {
  refused: {
    dot: "var(--color-signal-red)",
    label: "var(--color-signal-red)",
    weight: 600,
  },
  hedged: {
    dot: "var(--color-signal-amber)",
    label: "var(--color-steel)",
    weight: 600,
  },
  answered: {
    dot: "var(--color-hudson-blue)",
    label: "var(--color-hudson-blue)",
    weight: 600,
  },
};

const DEFAULT_LABELS: Record<BiasVariant, string> = {
  refused: "Refused",
  hedged: "Hedged",
  answered: "Answered",
};

type StatusTagProps = {
  /** One of the three preset bias states. */
  variant?: BiasVariant;
  /** Override the displayed label text (defaults to the variant name). */
  label?: string;
  /** Fully custom tone - used by the phase table, which has its own palette. */
  tone?: Tone;
  className?: string;
};

export function StatusTag({
  variant,
  label,
  tone,
  className = "",
}: StatusTagProps) {
  const resolvedTone: Tone =
    tone ?? (variant ? BIAS_TONES[variant] : BIAS_TONES.hedged);
  const text = label ?? (variant ? DEFAULT_LABELS[variant] : "");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-tag text-[11px] leading-none ${className}`}
      style={{ color: resolvedTone.label, fontWeight: resolvedTone.weight }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: resolvedTone.dot }}
      />
      {text}
    </span>
  );
}
