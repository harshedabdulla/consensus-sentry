"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Key, FileText, Check } from "lucide-react";
import { GlyphWallpaper } from "./ui/glyph-wallpaper";

/*
  Scrollytelling section. The left thesis column is pinned (sticky) while the
  reader scrolls a tall track; the right architecture diagram advances one node
  per scroll segment, each with its own animation kind, ending in a verified
  "completed" state.

  step 0 — User Query        (slides in)
  step 1 — Sentry Shield     (connector draws + shield pulses)
  step 2 — Audit Proof       (connector draws + proof stamps in)
  step 3 — Completed         (verification seal settles, connectors flow)
*/

const STEP_COPY = [
  {
    n: "1",
    title: "Prompt ingress",
    body: "User inputs a query. The guardrail intercepts it to guarantee adherence to sovereign guidelines.",
  },
  {
    n: "2",
    title: "Rule evaluation",
    body: "Determines policy enforcement — Refused, Hedged, or Answered — authored by diverse, certified panels.",
  },
  {
    n: "3",
    title: "Attestation signature",
    body: "Generates a cryptographically signed provenance record. Anyone can verify which rules fired and when.",
  },
  {
    n: "✓",
    title: "Pipeline verified",
    body: "Every decision now carries an externally auditable record of which rule fired, who authored it, and when.",
  },
] as const;

const STEP_LABELS = ["Query", "Evaluate", "Attest"] as const;

// A diagram node is either the live step ("current", Hudson Blue) or already
// built ("done", calm grey). Skeleton/upcoming nodes are drawn separately.
type NodeState = "current" | "done";

const NODE_STROKE: Record<NodeState, string> = {
  current: "var(--color-design-hudson-blue)",
  done: "var(--color-slate-pencil)",
};
const NODE_STROKE_W: Record<NodeState, string> = { current: "2", done: "1.5" };
const NODE_LABEL: Record<NodeState, string> = {
  current: "var(--color-lampblack)",
  done: "var(--color-steel)",
};
const NODE_ICON: Record<NodeState, string> = {
  current: "text-design-hudson-blue",
  done: "text-steel",
};

export function Problem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);

  // Reveal the first node only once the section is actually on screen, so the
  // "slide in" entrance isn't wasted while the section is far below the fold.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "-20% 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Map scroll position within the pinned track to a discrete step (0–3).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Scroll-driving is a desktop affordance; on narrow/short viewports the
      // diagram simply renders its finished state.
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

  // Cumulative visibility of each node, plus which one is the "live" step.
  const show1 = inView; // step >= 0
  const show2 = step >= 1;
  const show3 = step >= 2;
  const done = step >= 3;

  // Three visual states for a node: faint skeleton (handled separately),
  // "done" (built — calm grey), and "current" (the live step — Hudson Blue).
  // Diagram highlights use the Hudson Blue token per the design contract.
  const s0: NodeState = step === 0 ? "current" : "done";
  const s1: NodeState = step === 1 ? "current" : "done";
  const s2: NodeState = step === 2 ? "current" : "done";

  return (
    <section id="problem" ref={sectionRef} className="px-6 pt-28 md:pt-40">
      {/* Tall track gives the pinned panel room to scroll through its steps.
          On mobile the track collapses to content height (no pinning). */}
      <div ref={trackRef} className="relative mx-auto max-w-[1100px] lg:h-[340vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
          <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: pinned thesis — stands as it is while scrolling */}
            <div className="lg:col-span-7">
              <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-lampblack md:text-[48px]">
                Principles exist. Infrastructure does not.
              </h2>

              <div className="mt-8 space-y-6 text-[15px] leading-[1.65] text-steel">
                <p>
                  Every day, AI systems refuse questions, hedge on contested
                  topics, and treat two equivalent queries differently. These are
                  moderation decisions, but they are invisible. There is no
                  mechanism for the person affected, or anyone else, to verify
                  which rule was applied, who authored it, when it last changed,
                  or whether other people were treated the same way.
                </p>
                <p className="font-semibold text-lampblack">
                  The bias is real and measurable. The accountability layer is
                  not. This project builds that layer.
                </p>
              </div>
            </div>

            {/* Right Column: scroll-driven technical diagram */}
            <div className="lg:col-span-5">
              <div className="relative flex flex-col overflow-hidden rounded-card border border-bone-mist bg-paper-white p-6 shadow-card">
                <GlyphWallpaper variant="surface" className="opacity-[0.08]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.94)_42%,rgba(255,255,255,0.98))]" />
                <div className="relative">
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-design-hudson-blue/15 px-2.5 py-0.5 text-[10px] font-semibold text-design-hudson-blue">
                      <span className="h-1.5 w-1.5 rounded-full bg-design-hudson-blue animate-pulse-ring" />
                      Audit Pipeline
                    </span>
                  )}
                </div>

                {/* Step progress rail — shows which node the scroll is on */}
                <div className="mt-5 flex items-center gap-2">
                  {STEP_LABELS.map((label, i) => {
                    const active = step === i;
                    const complete = step > i;
                    return (
                      <div key={label} className="flex flex-1 flex-col gap-1.5">
                        <span
                          className="h-[3px] w-full rounded-full transition-colors duration-500"
                          style={{
                            backgroundColor: complete
                              ? "var(--color-steel)"
                              : active
                                ? "var(--color-design-hudson-blue)"
                                : "var(--color-bone-mist)",
                          }}
                        />
                        <span
                          className="text-[10px] font-semibold tracking-tight transition-colors duration-500"
                          style={{
                            color:
                              active || complete
                                ? "var(--color-steel)"
                                : "var(--color-slate-pencil)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* SVG canvas */}
                <div className="relative mt-6 flex justify-center overflow-hidden rounded-tag border border-bone-mist/60 bg-design-linen py-6">
                  <GlyphWallpaper variant="surface" className="opacity-[0.12]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.78),rgba(249,250,247,0.92)_62%,rgba(249,250,247,0.98))]" />
                  <svg viewBox="0 0 400 180" className="relative z-10 w-full max-w-[340px] overflow-visible">
                    <defs>
                      <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="0.75" fill="var(--color-bone-mist)" opacity="0.4" />
                      </pattern>
                      <marker
                        id="flow-arrow"
                        viewBox="0 0 8 8"
                        refX="5.5"
                        refY="4"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto-start-reverse"
                      >
                        <path
                          d="M1.5 1.5 L5.5 4 L1.5 6.5"
                          fill="none"
                          stroke="var(--color-design-hudson-blue)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </marker>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dot-grid)" />

                    {/* Faint skeleton of the full pipeline, always present */}
                    <g opacity="0.18">
                      <path d="M 110 90 L 155 90" stroke="var(--color-bone-mist)" strokeWidth="1.5" />
                      <path d="M 245 90 L 290 90" stroke="var(--color-bone-mist)" strokeWidth="1.5" />
                      <rect x="20" y="55" width="90" height="70" rx="4" fill="none" stroke="var(--color-bone-mist)" strokeWidth="1.5" />
                      <rect x="155" y="45" width="90" height="90" rx="4" fill="none" stroke="var(--color-bone-mist)" strokeWidth="1.5" />
                      <rect x="290" y="55" width="90" height="70" rx="4" fill="none" stroke="var(--color-bone-mist)" strokeWidth="1.5" />
                    </g>

                    {/* Connector 1 — draws in at step 2, flows once shield is live */}
                    {show2 && (
                      <path
                        key="conn1"
                        d="M 112 90 L 150 90"
                        fill="none"
                        stroke="var(--color-design-hudson-blue)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        pathLength={1}
                        markerEnd="url(#flow-arrow)"
                        className={done ? "animate-dash" : "anim-draw"}
                      />
                    )}

                    {/* Connector 2 — draws in at step 3 */}
                    {show3 && (
                      <path
                        key="conn2"
                        d="M 247 90 L 285 90"
                        fill="none"
                        stroke="var(--color-design-hudson-blue)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        pathLength={1}
                        markerEnd="url(#flow-arrow)"
                        className={done ? "animate-dash" : "anim-draw"}
                      />
                    )}

                    {/* Node 1: User Query — slides in */}
                    {show1 && (
                      <g key="node-query" className="anim-slide-in">
                        <rect
                          x="20"
                          y="55"
                          width="90"
                          height="70"
                          rx="4"
                          fill="var(--color-paper-white)"
                          stroke={NODE_STROKE[s0]}
                          strokeWidth={NODE_STROKE_W[s0]}
                          className="transition-all duration-300"
                        />
                        <foreignObject x="53" y="68" width="24" height="24">
                          <div className={`transition-colors duration-300 ${NODE_ICON[s0]}`}>
                            <FileText size={18} strokeWidth={1.5} />
                          </div>
                        </foreignObject>
                        <text
                          x="65"
                          y="111"
                          textAnchor="middle"
                          className="text-[10px] font-semibold tracking-tight"
                          fill={NODE_LABEL[s0]}
                        >
                          User query
                        </text>
                      </g>
                    )}

                    {/* Node 2: Sentry Shield — fades in with a pulsing scan light */}
                    {show2 && (
                      <g key="node-shield" className="anim-fade-in">
                        <rect
                          x="155"
                          y="45"
                          width="90"
                          height="90"
                          rx="4"
                          fill="var(--color-paper-white)"
                          stroke={NODE_STROKE[s1]}
                          strokeWidth={NODE_STROKE_W[s1]}
                          className="transition-all duration-300"
                        />
                        <circle cx="235" cy="55" r="3" fill="var(--color-design-hudson-blue)" />
                        {step === 1 && (
                          <circle
                            cx="235"
                            cy="55"
                            r="6"
                            fill="none"
                            stroke="var(--color-design-hudson-blue)"
                            strokeOpacity="0.4"
                            strokeWidth="1"
                            className="animate-pulse-ring"
                          />
                        )}
                        <foreignObject x="189" y="62" width="24" height="24">
                          <div className={`transition-colors duration-300 ${NODE_ICON[s1]}`}>
                            <Shield size={22} strokeWidth={1.5} />
                          </div>
                        </foreignObject>
                        <text
                          x="200"
                          y="108"
                          textAnchor="middle"
                          className="text-[10px] font-semibold tracking-tight"
                          fill={NODE_LABEL[s1]}
                        >
                          Sentry shield
                        </text>
                        <text
                          x="200"
                          y="120"
                          textAnchor="middle"
                          className="text-[8px] tracking-[0.04em]"
                          fill="var(--color-slate-pencil)"
                        >
                          Enforcer
                        </text>
                      </g>
                    )}

                    {/* Node 3: Audit Proof — stamps in like a seal */}
                    {show3 && (
                      <g key="node-proof" className="anim-stamp">
                        <rect
                          x="290"
                          y="55"
                          width="90"
                          height="70"
                          rx="4"
                          fill="var(--color-paper-white)"
                          stroke={NODE_STROKE[s2]}
                          strokeWidth={NODE_STROKE_W[s2]}
                          className="transition-all duration-300"
                        />
                        <foreignObject x="323" y="68" width="24" height="24">
                          <div className={`transition-colors duration-300 ${NODE_ICON[s2]}`}>
                            <Key size={18} strokeWidth={1.5} />
                          </div>
                        </foreignObject>
                        <text
                          x="335"
                          y="111"
                          textAnchor="middle"
                          className="text-[10px] font-semibold tracking-tight"
                          fill={NODE_LABEL[s2]}
                        >
                          Audit proof
                        </text>
                      </g>
                    )}

                    {/* Completion seal — settles over the proof node at the end */}
                    {done && (
                      <g key="seal" className="anim-seal">
                        <circle cx="370" cy="60" r="11.5" fill="var(--color-paper-white)" />
                        <circle cx="370" cy="60" r="9.5" fill="var(--color-design-hudson-blue)" />
                        <foreignObject x="363" y="53" width="14" height="14">
                          <div className="text-paper-white">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        </foreignObject>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Figure caption */}
                <p className="mt-4 text-[12px] leading-[1.5] text-slate-pencil">
                  <span className="font-semibold text-steel">Fig. 1</span> — The
                  verifiable guardrail pipeline. Every decision produces a signed,
                  externally auditable record of which rule fired and when.
                </p>

                {/* Explanatory panel — desktop: scroll-synced; mobile: full list */}
                <div className="mt-6 rounded-tag bg-design-linen p-4 border border-bone-mist/60">
                  {/* Desktop: one step at a time, driven by scroll */}
                  <div key={step} className="hidden cs-fade-in lg:block">
                    <h4 className="flex items-center gap-2 text-[12px] font-semibold text-lampblack">
                      <span
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold"
                        style={{
                          backgroundColor: done
                            ? "var(--color-design-hudson-blue)"
                            : "var(--color-bone-mist)",
                          color: done
                            ? "var(--color-paper-white)"
                            : "var(--color-steel)",
                        }}
                      >
                        {STEP_COPY[step].n}
                      </span>
                      {STEP_COPY[step].title}
                    </h4>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-steel">
                      {STEP_COPY[step].body}
                    </p>
                  </div>

                  {/* Mobile: the full pipeline, listed */}
                  <ul className="space-y-3 lg:hidden">
                    {STEP_COPY.slice(0, 3).map((s) => (
                      <li key={s.title}>
                        <h4 className="flex items-center gap-2 text-[12px] font-semibold text-lampblack">
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-bone-mist text-[9px] font-semibold text-steel">
                            {s.n}
                          </span>
                          {s.title}
                        </h4>
                        <p className="mt-1 text-[12px] leading-relaxed text-steel">
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
      </div>
    </section>
  );
}
