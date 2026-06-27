"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Shield, Key, FileText, Check } from "lucide-react";
import { GlyphWallpaper } from "./ui/glyph-wallpaper";

/*
  Scrollytelling section. The left thesis column is pinned (sticky) while the
  reader scrolls a tall track; the right architecture panel focuses on ONE
  pipeline phase at a time, each with its own larger "under the hood" scene
  and a short detail list, ending in a verified "completed" state.

  step 0 — Prompt ingress        (the query is captured and intercepted)
  step 1 — Rule evaluation       (the ruleset is scanned, a rule fires)
  step 2 — Attestation signature (the decision is hashed and signed)
  step 3 — Pipeline verified     (the signed provenance record is sealed)
*/

const ICONS = [FileText, Shield, Key, Check] as const;

type Step = {
  n: string;
  label: string;
  title: string;
  body: string;
  /** Short "under the hood" lines, revealed one phase at a time. */
  details: string[];
};

const STEPS: Step[] = [
  {
    n: "1",
    label: "Query",
    title: "Prompt ingress",
    body: "A user query arrives and is intercepted by the guardrail before any model sees it.",
    details: [
      "Inbound prompt captured",
      "Normalized & tokenized",
      "Routed to the policy engine",
    ],
  },
  {
    n: "2",
    label: "Evaluate",
    title: "Rule evaluation",
    body: "The active ruleset is scanned. One rule fires and sets the decision — Refused, Hedged, or Answered.",
    details: [
      "Ruleset v2.3 loaded · 142 rules",
      "Match → refusal.contested.v4",
      "Decision → Hedged",
    ],
  },
  {
    n: "3",
    label: "Attest",
    title: "Attestation signature",
    body: "The decision is canonicalized, hashed, and signed — so anyone can verify which rule fired and when.",
    details: [
      "Decision canonicalized & hashed",
      "Signed with the author key",
      "Record appended to the log",
    ],
  },
  {
    n: "✓",
    label: "Verified",
    title: "Pipeline verified",
    body: "Every decision now carries an externally auditable record of which rule fired, who authored it, and when.",
    details: [
      "Which rule fired",
      "Who authored it & version",
      "The exact time of decision",
    ],
  },
];

const MONO = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

// Shared colors pulled from the design tokens for use inside SVG fills.
const ACCENT = "var(--color-design-hudson-blue)";
const INK = "var(--color-lampblack)";
const STEEL = "var(--color-steel)";
const MUTED = "var(--color-slate-pencil)";
const LINE = "var(--color-bone-mist)";
const SURFACE = "var(--color-paper-white)";

export function Problem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  // Map scroll position within the pinned track to a discrete step (0–3).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Scroll-driving is a desktop affordance; on narrow/short viewports the
      // panel simply renders its finished state.
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (!isDesktop || total <= 0) {
        setStep(3);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = scrolled / total; // 0 → 1
      const next = Math.min(3, Math.floor(progress / 0.25 + 0.0001));
      setStep(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const done = step >= 3;
  const active = STEPS[step];

  return (
    <section id="problem" ref={sectionRef} className="px-6 pt-28 md:pt-40">
      {/* Tall track gives the pinned panel room to scroll through its phases.
          On mobile the track collapses to content height (no pinning). */}
      <div ref={trackRef} className="relative mx-auto max-w-[1100px] lg:h-[380vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
          <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: pinned thesis — stands as it is while scrolling */}
            <div className="lg:col-span-6">
              <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-balance text-lampblack md:text-[48px]">
                Principles exist. Infrastructure does not.
              </h2>

              <div className="mt-8 space-y-6 text-[15px] leading-[1.65] text-steel">
                <p>
                  Every day, AI systems refuse questions, hedge on contested
                  topics, and treat equivalent queries differently. The decision
                  disappears the moment it is made.
                </p>
                <p className="font-semibold text-lampblack">
                  The bias is visible. The record is missing.
                </p>
              </div>
            </div>

            {/* Right Column: scroll-driven, one-phase-at-a-time architecture */}
            <div className="lg:col-span-6">
              <div className="relative flex flex-col overflow-hidden rounded-card bg-transparent backdrop-blur-sm p-6 md:p-8">
                <GlyphWallpaper variant="surface" className="opacity-[0.06]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(253,247,241,0.35),rgba(253,247,241,0.5)_42%,rgba(253,247,241,0.62))]" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-pencil uppercase">
                      Technical Architecture
                    </span>
                    {done ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-design-hudson-blue/15 px-2.5 py-0.5 text-[10px] font-semibold text-design-hudson-blue">
                        <Check size={11} strokeWidth={3} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-transparent px-2.5 py-0.5 text-[10px] font-semibold text-design-hudson-blue">
                        <span className="h-1.5 w-1.5 rounded-full bg-design-hudson-blue animate-pulse-ring" />
                        Audit Pipeline
                      </span>
                    )}
                  </div>

                  {/* Pipeline map — small, for orientation. Lights up the live node. */}
                  <div className="mt-6 flex items-center">
                    {STEPS.map((s, i) => {
                      const Icon = ICONS[i];
                      const isActive = step === i;
                      const isDone = step > i;
                      return (
                        <Fragment key={s.label}>
                          <div className="flex flex-col items-center gap-1.5">
                            <span
                              className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-[color,background-color,border-color] duration-300 ${
                                isActive
                                  ? "text-design-hudson-blue"
                                  : isDone
                                    ? "border-steel/40 bg-steel/5 text-steel"
                                    : "border-bone-mist text-slate-pencil/50"
                              }`}
                            >
                              <Icon size={14} strokeWidth={1.75} />
                              {isActive && (
                                <span className="absolute inset-0 rounded-full border border-design-hudson-blue/40 animate-pulse-ring" />
                              )}
                            </span>
                            <span
                              className={`text-[10px] font-semibold tracking-tight transition-colors duration-500 ${
                                isActive || isDone
                                  ? "text-steel"
                                  : "text-slate-pencil/60"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <span
                              className="mx-1 mb-5 h-px flex-1 transition-colors duration-500"
                              style={{
                                backgroundColor: isDone ? STEEL : LINE,
                              }}
                            />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>

                  {/* The larger per-phase stage — one scene at a time. Keyed on
                      the step so each scene remounts and replays its entrance. */}
                  <div
                    key={step}
                    className="relative mt-7 flex h-[210px] items-center justify-center overflow-hidden rounded-card bg-design-linen/40"
                  >
                    <GlyphWallpaper variant="surface" className="opacity-[0.08]" />
                    <Stage step={step} />
                  </div>

                  {/* Figure caption */}
                  <p className="mt-4 text-[12px] leading-[1.5] text-slate-pencil">
                    <span className="font-semibold text-steel">Fig. 1</span> — The
                    verifiable guardrail pipeline, one phase at a time. Every
                    decision produces a signed, externally auditable record.
                  </p>

                  {/* Under-the-hood detail — desktop: scroll-synced single phase */}
                  <div
                    key={`copy-${step}`}
                    className="mt-6 hidden cs-fade-in lg:block"
                  >
                    <h3 className="flex items-center gap-2 text-[13px] font-semibold text-lampblack">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: done ? ACCENT : LINE,
                          color: done ? SURFACE : STEEL,
                        }}
                      >
                        {active.n}
                      </span>
                      {active.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-steel">
                      {active.body}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {active.details.map((d) => (
                        <li
                          key={d}
                          className="flex items-center gap-2 text-[11.5px] text-steel"
                        >
                          {done ? (
                            <Check
                              size={12}
                              strokeWidth={3}
                              className="shrink-0 text-design-hudson-blue"
                            />
                          ) : (
                            <span className="h-1 w-1 shrink-0 rounded-full" />
                          )}
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mobile: the full pipeline, listed */}
                  <ul className="mt-6 space-y-4 lg:hidden">
                    {STEPS.map((s) => (
                      <li key={s.title}>
                        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-lampblack">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-bone-mist text-[10px] font-semibold text-steel">
                            {s.n}
                          </span>
                          {s.title}
                        </h3>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-steel">
                          {s.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* A shared arrow marker + the per-phase scene. Each scene lives in a single
   SVG (the parent remounts it per step, so entrance animations replay). */
function Stage({ step }: { step: number }) {
  return (
    <svg
      viewBox="0 0 360 200"
      aria-hidden="true"
      className="relative z-10 w-full max-w-[440px] overflow-visible"
    >
      <defs>
        <marker
          id="stage-arrow"
          viewBox="0 0 8 8"
          refX="5.5"
          refY="4"
          markerWidth="5.5"
          markerHeight="5.5"
          orient="auto-start-reverse"
        >
          <path
            d="M1.5 1.5 L5.5 4 L1.5 6.5"
            fill="none"
            stroke={ACCENT}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {step === 0 && <SceneIngress />}
      {step === 1 && <SceneEvaluate />}
      {step === 2 && <SceneAttest />}
      {step >= 3 && <SceneVerified />}
    </svg>
  );
}

function SceneIngress() {
  return (
    <>
      {/* The inbound prompt */}
      <g className="anim-slide-in">
        <rect
          x="14"
          y="50"
          width="150"
          height="104"
          rx="8"
          fill={SURFACE}
          stroke={LINE}
          strokeWidth="1.5"
        />
        <circle cx="30" cy="68" r="3" fill={MUTED} />
        <text x="42" y="71" className="text-[9px]" fill={MUTED}>
          prompt
        </text>
        <rect x="28" y="86" width="122" height="7" rx="3.5" fill={LINE} />
        <rect x="28" y="100" width="100" height="7" rx="3.5" fill={LINE} />
        <rect x="28" y="114" width="70" height="7" rx="3.5" fill={ACCENT} opacity="0.45" />
        <rect x="101" y="112" width="2" height="11" fill={ACCENT} />
      </g>

      {/* Flow into the guardrail */}
      <path
        d="M 170 102 L 204 102"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#stage-arrow)"
        className="animate-dash"
      />

      {/* The guardrail gate intercepts it */}
      <g className="anim-fade-in">
        <rect
          x="212"
          y="42"
          width="134"
          height="120"
          rx="8"
          fill={SURFACE}
          stroke={ACCENT}
          strokeWidth="2"
        />
        <rect
          x="222"
          y="56"
          width="114"
          height="2.5"
          rx="1.25"
          fill={ACCENT}
          opacity="0.5"
          className="anim-scan"
          style={{ "--scan-d": "92px" } as React.CSSProperties}
        />
        <foreignObject x="263" y="74" width="32" height="32">
          <div className="text-design-hudson-blue">
            <Shield size={32} strokeWidth={1.5} />
          </div>
        </foreignObject>
        <text
          x="279"
          y="128"
          textAnchor="middle"
          className="text-[11px] font-semibold tracking-tight"
          fill={INK}
        >
          Guardrail
        </text>
        <text x="279" y="142" textAnchor="middle" className="text-[8px]" fill={MUTED}>
          intercept
        </text>
      </g>
    </>
  );
}

function SceneEvaluate() {
  const rules = [
    "safety.csam.v9",
    "refusal.contested.v4",
    "pii.redaction.v2",
    "tone.hedge.v3",
  ];
  const matchIndex = 1;
  return (
    <>
      {/* Ruleset panel */}
      <g className="anim-fade-in">
        <rect
          x="16"
          y="26"
          width="212"
          height="148"
          rx="8"
          fill={SURFACE}
          stroke={LINE}
          strokeWidth="1.5"
        />
        <text x="30" y="46" className="text-[9px] font-semibold tracking-[0.08em]" fill={MUTED}>
          RULESET v2.3
        </text>

        {/* The scanning highlight sweeping down the rows */}
        <rect
          x="24"
          y="56"
          width="196"
          height="22"
          rx="4"
          fill={ACCENT}
          opacity="0.1"
          className="anim-scan"
          style={{ "--scan-d": "96px" } as React.CSSProperties}
        />

        {rules.map((rule, i) => {
          const matched = i === matchIndex;
          const y = 58 + i * 27;
          return (
            <g key={rule}>
              {matched && (
                <rect
                  x="24"
                  y={y}
                  width="196"
                  height="22"
                  rx="4"
                  fill={ACCENT}
                  opacity="0.12"
                />
              )}
              <circle
                cx="36"
                cy={y + 11}
                r="3"
                fill={matched ? ACCENT : LINE}
              />
              <text
                x="48"
                y={y + 14}
                className="text-[9.5px]"
                style={MONO}
                fill={matched ? INK : MUTED}
                fontWeight={matched ? 600 : 400}
              >
                {rule}
              </text>
            </g>
          );
        })}
      </g>

      {/* Decision chip — stamps in */}
      <path
        d="M 230 100 L 248 100"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#stage-arrow)"
        className="animate-dash"
      />
      <g className="anim-stamp">
        <rect
          x="252"
          y="82"
          width="94"
          height="36"
          rx="18"
          fill={SURFACE}
          stroke={ACCENT}
          strokeWidth="1.5"
        />
        {/* Hedged: slate dot + steel label, per the bias-demo semantic states */}
        <circle cx="272" cy="100" r="3.5" fill={MUTED} />
        <text
          x="284"
          y="104"
          className="text-[12px] font-semibold tracking-tight"
          fill={STEEL}
        >
          Hedged
        </text>
      </g>
    </>
  );
}

function SceneAttest() {
  return (
    <>
      {/* The decision going in */}
      <g className="anim-fade-in">
        <rect x="10" y="78" width="78" height="44" rx="8" fill={SURFACE} stroke={LINE} strokeWidth="1.5" />
        <text x="49" y="98" textAnchor="middle" className="text-[9px]" fill={MUTED}>
          decision
        </text>
        <text x="49" y="110" textAnchor="middle" className="text-[10px] font-semibold" fill={STEEL}>
          Hedged
        </text>
      </g>

      <path
        d="M 92 100 L 110 100"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#stage-arrow)"
        className="animate-dash"
      />

      {/* Hashed */}
      <g className="anim-fade-in">
        <rect x="116" y="62" width="150" height="76" rx="8" fill={SURFACE} stroke={ACCENT} strokeWidth="1.5" />
        <text x="130" y="82" className="text-[9px] font-semibold tracking-[0.08em]" fill={MUTED}>
          SHA-256
        </text>
        <text x="130" y="102" className="text-[9.5px]" style={MONO} fill={INK}>
          a3f1c9e7 4b20d8aa
        </text>
        <text x="130" y="116" className="text-[9.5px]" style={MONO} fill={INK}>
          7e0c11f5 9d36b2c8
        </text>
        <rect
          x="130"
          y="80"
          width="104"
          height="2"
          rx="1"
          fill={ACCENT}
          opacity="0.4"
          className="anim-scan"
          style={{ "--scan-d": "44px" } as React.CSSProperties}
        />
      </g>

      <path
        d="M 270 100 L 286 100"
        fill="none"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeLinecap="round"
        markerEnd="url(#stage-arrow)"
        className="animate-dash"
      />

      {/* Signed seal */}
      <g className="anim-stamp">
        <circle cx="318" cy="100" r="26" fill={SURFACE} stroke={ACCENT} strokeWidth="2" />
        <foreignObject x="306" y="88" width="24" height="24">
          <div className="text-design-hudson-blue">
            <Key size={24} strokeWidth={1.5} />
          </div>
        </foreignObject>
        <text x="318" y="142" textAnchor="middle" className="text-[8px]" fill={MUTED}>
          signed
        </text>
      </g>
    </>
  );
}

function SceneVerified() {
  const rows = [
    ["Rule", "refusal.contested.v4"],
    ["Author", "panel-IN-07"],
    ["Version", "v2.3"],
    ["Time", "2026-06-27 14:22 UTC"],
  ];
  return (
    <>
      <g className="anim-fade-in">
        <rect x="22" y="22" width="262" height="156" rx="10" fill={SURFACE} stroke={LINE} strokeWidth="1.5" />
        <text x="38" y="44" className="text-[9px] font-semibold tracking-[0.08em]" fill={MUTED}>
          PROVENANCE RECORD
        </text>
        {rows.map(([label, value], i) => {
          const y = 64 + i * 27;
          return (
            <g key={label}>
              <text x="38" y={y} className="text-[10px]" fill={MUTED}>
                {label}
              </text>
              <text
                x="104"
                y={y}
                className="text-[9.5px]"
                style={MONO}
                fill={INK}
              >
                {value}
              </text>
              <foreignObject x="258" y={y - 11} width="14" height="14">
                <div className="text-design-hudson-blue">
                  <Check size={13} strokeWidth={3} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </g>

      {/* Settling verification seal */}
      <g className="anim-seal">
        <circle cx="300" cy="40" r="22" fill={SURFACE} />
        <circle cx="300" cy="40" r="18" fill={ACCENT} />
        <foreignObject x="290" y="30" width="20" height="20">
          <div className="text-paper-white">
            <Check size={20} strokeWidth={3} />
          </div>
        </foreignObject>
      </g>
    </>
  );
}
