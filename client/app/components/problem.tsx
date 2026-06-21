"use client";

import { useState } from "react";
import { Shield, Key, FileText } from "lucide-react";

export function Problem() {
  const [hoveredNode, setHoveredNode] = useState<"query" | "guardrail" | "proof" | null>(null);

  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Original Content */}
          <div className="lg:col-span-7">
            <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-lampblack md:text-[48px]">
              Principles exist. Infrastructure does not.
            </h2>

            <div className="mt-8 space-y-6 text-[15px] leading-[1.65] text-steel">
              <p>
                Every day, AI systems refuse questions, hedge on contested topics,
                and treat two equivalent queries differently. These are moderation
                decisions, but they are invisible. There is no mechanism for
                the person affected, or anyone else, to verify which rule was
                applied, who authored it, when it last changed, or whether other
                people were treated the same way.
              </p>
              <p>
                Governments have begun writing the principles down. India&rsquo;s AI
                Governance Guidelines (MeitY, November 2025) name Transparency,
                Accountability, and &ldquo;Understandable by Design&rdquo;; other
                jurisdictions are converging on the same ground. The principles are
                sound. The technical means to enforce, audit, or contest them in
                practice do not yet exist.
              </p>
              <p className="font-semibold text-lampblack">
                The bias is real and measurable. The accountability layer is not.
                This project builds that layer.
              </p>
            </div>
          </div>

          {/* Right Column: Clean Technical Diagram Card */}
          <div className="lg:col-span-5">
            <div className="flex flex-col rounded-card border border-bone-mist bg-paper-white p-6 shadow-card hover:shadow-elevated transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-slate-pencil uppercase">
                  Technical Architecture
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-design-hudson-blue/15 px-2.5 py-0.5 text-[10px] font-semibold text-design-hudson-blue">
                  <span className="h-1.5 w-1.5 rounded-full bg-design-hudson-blue animate-pulse-ring" />
                  Audit Pipeline
                </span>
              </div>

              {/* Redesigned Clean SVG Canvas */}
              <div className="relative mt-8 flex justify-center py-6 bg-design-linen rounded-tag border border-bone-mist/60 overflow-hidden">
                <svg viewBox="0 0 400 180" className="w-full max-w-[340px] overflow-visible">
                  {/* Background technical dot grid */}
                  <defs>
                    <pattern id="dot-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.75" fill="var(--color-bone-mist)" opacity="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dot-grid)" />

                  {/* Connectors / Arrows */}
                  <g>
                    {/* Path 1 */}
                    <path
                      d="M 110 90 L 155 90"
                      fill="none"
                      stroke="var(--color-bone-mist)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 110 90 L 155 90"
                      fill="none"
                      stroke="var(--color-violet-ink)"
                      strokeWidth="1.5"
                      className="animate-dash"
                      style={{ opacity: hoveredNode === "query" || hoveredNode === "guardrail" ? 1 : 0.2 }}
                    />
                    
                    {/* Path 2 */}
                    <path
                      d="M 245 90 L 290 90"
                      fill="none"
                      stroke="var(--color-bone-mist)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 245 90 L 290 90"
                      fill="none"
                      stroke="var(--color-violet-ink)"
                      strokeWidth="1.5"
                      className="animate-dash"
                      style={{ opacity: hoveredNode === "guardrail" || hoveredNode === "proof" ? 1 : 0.2 }}
                    />
                  </g>

                  {/* Node 1: Input Query Box */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode("query")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x="20"
                      y="55"
                      width="90"
                      height="70"
                      rx="8"
                      fill="var(--color-paper-white)"
                      stroke={hoveredNode === "query" ? "var(--color-violet-ink)" : "var(--color-bone-mist)"}
                      strokeWidth={hoveredNode === "query" ? "2" : "1.5"}
                      className="transition-all duration-300"
                    />
                    <foreignObject x="53" y="68" width="24" height="24">
                      <div className={`transition-colors duration-300 ${hoveredNode === "query" ? "text-design-hudson-blue" : "text-slate-pencil"}`}>
                        <FileText size={18} strokeWidth={1.5} />
                      </div>
                    </foreignObject>
                    <text
                      x="65"
                      y="110"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-semibold tracking-tight"
                      fill={hoveredNode === "query" ? "var(--color-lampblack)" : "var(--color-slate-pencil)"}
                    >
                      User Query
                    </text>
                  </g>

                  {/* Node 2: Sentry Shield Box */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode("guardrail")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x="155"
                      y="45"
                      width="90"
                      height="90"
                      rx="8"
                      fill="var(--color-paper-white)"
                      stroke={hoveredNode === "guardrail" ? "var(--color-violet-ink)" : "var(--color-bone-mist)"}
                      strokeWidth={hoveredNode === "guardrail" ? "2" : "1.5"}
                      className="transition-all duration-300"
                    />
                    {/* Pulsing indicator light */}
                    <circle
                      cx="235"
                      cy="55"
                      r="3"
                      className="fill-design-hudson-blue"
                    />
                    <circle
                      cx="235"
                      cy="55"
                      r="6"
                      fill="none"
                      className="stroke-design-hudson-blue/40 animate-pulse-ring"
                      strokeWidth="1"
                    />
                    <foreignObject x="189" y="64" width="24" height="24">
                      <div className={`transition-colors duration-300 ${hoveredNode === "guardrail" ? "text-design-hudson-blue" : "text-slate-pencil"}`}>
                        <Shield size={22} strokeWidth={1.5} />
                      </div>
                    </foreignObject>
                    <text
                      x="200"
                      y="110"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-semibold tracking-tight"
                      fill={hoveredNode === "guardrail" ? "var(--color-lampblack)" : "var(--color-slate-pencil)"}
                    >
                      Sentry Shield
                    </text>
                    <text
                      x="200"
                      y="122"
                      textAnchor="middle"
                      className="text-[8px] font-mono text-[var(--color-slate-pencil)]/60"
                    >
                      ENFORCER
                    </text>
                  </g>

                  {/* Node 3: Cryptographic Proof Box */}
                  <g
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode("proof")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x="290"
                      y="55"
                      width="90"
                      height="70"
                      rx="8"
                      fill="var(--color-paper-white)"
                      stroke={hoveredNode === "proof" ? "var(--color-violet-ink)" : "var(--color-bone-mist)"}
                      strokeWidth={hoveredNode === "proof" ? "2" : "1.5"}
                      className="transition-all duration-300"
                    />
                    <foreignObject x="323" y="68" width="24" height="24">
                      <div className={`transition-colors duration-300 ${hoveredNode === "proof" ? "text-design-hudson-blue" : "text-slate-pencil"}`}>
                        <Key size={18} strokeWidth={1.5} />
                      </div>
                    </foreignObject>
                    <text
                      x="335"
                      y="110"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-semibold tracking-tight"
                      fill={hoveredNode === "proof" ? "var(--color-lampblack)" : "var(--color-slate-pencil)"}
                    >
                      Audit Proof
                    </text>
                  </g>
                </svg>
              </div>

              {/* Figure caption — academic register, the GIC "Fig. N" move */}
              <p className="mt-4 text-[12px] leading-[1.5] text-slate-pencil">
                <span className="font-semibold text-steel">Fig. 1</span> — The
                verifiable guardrail pipeline. Every decision produces a signed,
                externally auditable record of which rule fired and when.
              </p>

              {/* Refined Explanatory Panel (No arrow characters) */}
              <div className="mt-6 min-h-[76px] rounded-tag bg-design-linen p-4 border border-bone-mist/60">
                {hoveredNode === "query" && (
                  <div className="cs-fade-in">
                    <h4 className="text-[12px] font-semibold text-lampblack">
                      1. Prompt Ingress
                    </h4>
                    <p className="mt-1 text-[12px] leading-relaxed text-steel">
                      User inputs a query. The guardrail intercepts it to guarantee adherence to sovereign guidelines.
                    </p>
                  </div>
                )}
                {hoveredNode === "guardrail" && (
                  <div className="cs-fade-in">
                    <h4 className="text-[12px] font-semibold text-lampblack">
                      2. Rule Evaluation
                    </h4>
                    <p className="mt-1 text-[12px] leading-relaxed text-steel">
                      Determines policy enforcement (Refused, Hedged, or Answered) authored by diverse, certified panels.
                    </p>
                  </div>
                )}
                {hoveredNode === "proof" && (
                  <div className="cs-fade-in">
                    <h4 className="text-[12px] font-semibold text-lampblack">
                      3. Attestation Signature
                    </h4>
                    <p className="mt-1 text-[12px] leading-relaxed text-steel">
                      Generates a cryptographically signed provenance record. Anyone can verify which rules fired and when.
                    </p>
                  </div>
                )}
                {!hoveredNode && (
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-[12px] italic text-slate-pencil">
                      Hover over nodes to inspect the verifiable pipeline.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
