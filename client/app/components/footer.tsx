"use client";

// lucide-react 1.x removed brand marks (no Github icon). Per the design rules
// (Lucide outline icons only - no inline brand SVGs), GitBranch is the faithful
// repository-semantic substitute. The aria-label makes the destination clear.
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, GitBranch, MessagesSquare } from "lucide-react";
import { ParallaxBg } from "./ui/parallax-bg";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

// The footer is the page's second painted full-bleed moment (DESIGN.md: the
// painted hero is answered by a closing painted band). Content sits in white
// over the dusk painting; the cooler image is pulled toward the warm tableau
// with a terracotta wash and darkened for type contrast.
const FOOTER_BACKGROUND = "/hero-bg-3.jpg";

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
  /** Shown in place of a link when there's no destination yet. */
  status?: string;
};

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Project",
    links: [
      { label: "Research", status: "Soon" },
      { label: "Benchmark", status: "Soon" },
      { label: "Repository", href: REPO_URL, external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Discussions", href: DISCUSSIONS_URL, external: true },
      { label: "Get in touch", href: DISCUSSIONS_URL, external: true },
    ],
  },
];

export function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
      setTime(`${formatted} DEL`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="relative mt-20 w-full overflow-hidden px-6 pt-20 pb-[calc(3rem+env(safe-area-inset-bottom))] md:mt-28 md:pt-28"
    >
      <ParallaxBg src={FOOTER_BACKGROUND} />
      <div className="absolute inset-0 bg-black/[0.52]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(216,158,96,0.30),transparent_50%),linear-gradient(180deg,rgba(36,26,16,0.34),rgba(36,26,16,0.58))]" />

      <div className="relative mx-auto max-w-[1200px]">
        {/* Closing statement - a last large display beat in the brand serif. */}
        <h2 className="max-w-[760px] font-serif text-[28px] leading-[1.25] font-light tracking-[-0.02em] text-balance text-white md:text-[34px]">
          Every refusal should{" "}
          <a
            href="#top"
            className="underline decoration-1 underline-offset-[4px] decoration-white/40 transition-colors hover:decoration-white"
          >
            leave a trace
          </a>
          .
        </h2>

        {/* Index: identity on the left, navigation columns + locale on the right. */}
        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-[15px] font-medium text-white">Consensus Sentry</p>
            <p className="mt-2 max-w-[320px] text-[13px] leading-[1.6] text-white/70">
              A research project on AI accountability infrastructure.
            </p>
            <p className="mt-4 text-[12px] text-white/55">
              Independent research · Phase 1 in progress
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} className="md:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.1em] text-white/55 uppercase">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="group inline-flex items-center gap-1 text-[13px] text-white/75 transition-colors hover:text-white"
                      >
                        {link.label}
                        {link.external && (
                          <ArrowUpRight
                            size={13}
                            strokeWidth={1.75}
                            aria-hidden="true"
                            className="text-white/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        )}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-[13px] text-white/60">
                        {link.label}
                        <span className="rounded-tag border border-white/25 px-1.5 py-px text-[10px] font-semibold text-white/60">
                          {link.status}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-3 md:text-right">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-white/55 uppercase">
              Locale
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[13px] text-white/75 md:justify-end">
              <Clock size={13} strokeWidth={1.5} className="text-white/50" />
              <span className="tabular-nums">{time || "DEL"}</span>
            </div>
          </div>
        </div>

        {/* Baseline: fine print + social marks. */}
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] text-white/55">
            © 2026 Consensus Sentry · Source available, license pending
          </p>
          <div className="flex items-center gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="text-white/80 transition-colors hover:text-white"
            >
              <GitBranch size={16} aria-hidden="true" />
            </a>
            <a
              href={DISCUSSIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub discussions"
              className="text-white/80 transition-colors hover:text-white"
            >
              <MessagesSquare size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
