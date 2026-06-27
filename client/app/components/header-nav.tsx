"use client";

import { useEffect, useState } from "react";
import { Clock, Stamp } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

function NavComingSoon({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        role="link"
        aria-disabled="true"
        tabIndex={0}
        className="cursor-default text-[13px] font-medium text-white/[0.58] transition-colors hover:text-white/[0.82]"
      >
        {label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute -bottom-9 left-1/2 z-50 -translate-x-1/2 rounded-tag border border-bone-mist bg-paper-white px-3 py-1 text-caption whitespace-nowrap text-steel opacity-0 shadow-card transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Coming soon
      </span>
    </span>
  );
}

export function HeaderNav() {
  const [time, setTime] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Solidify the floating pill once the reader has left the painted hero:
  // a touch more opacity + shadow for legibility over the content sections,
  // and quiet feedback that you've moved past the top. ScrollTrigger keyed to
  // the hero (#top) — no scroll listener; useGSAP handles cleanup.
  useGSAP(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const st = ScrollTrigger.create({
      trigger: hero,
      start: "bottom top+=120",
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });
    return () => st.kill();
  });

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      const formattedTime = formatter.format(new Date());
      setTime(`${formattedTime} DEL`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
      <header
        className={`mx-auto max-w-[880px] rounded-2xl border px-3 py-2.5 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none md:px-4 md:py-2 ${
          scrolled
            ? "border-white/20 bg-design-graphite-night/[0.9] shadow-[0_8px_24px_0_rgba(0,0,0,0.18)]"
            : "border-white/15 bg-design-graphite-night/[0.55] shadow-design-sm"
        }`}
      >
        <nav className="flex items-center justify-between gap-3 md:gap-4">
          <div className="flex min-w-0 items-center gap-2 md:flex-1 md:justify-start">
            <a
              href="#top"
              className="flex min-w-0 items-center gap-2 text-[14px] font-semibold tracking-tight text-paper-white transition-opacity hover:opacity-90"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white">
                <Stamp size={15} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="hidden sm:inline">Consensus Sentry</span>
              <span className="text-xs sm:hidden">C. Sentry</span>
            </a>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-x-4 gap-y-2 md:flex md:gap-x-8">
            <NavComingSoon label="Research" />
            <NavComingSoon label="Benchmark" />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-white/[0.74] no-underline transition-colors hover:text-white"
            >
              Repository
            </a>
          </div>

          <div className="flex items-center justify-end gap-3 md:gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-white/[0.74] no-underline transition-colors hover:text-white md:hidden"
            >
              Repository
            </a>

            {time && (
              <div className="hidden items-center gap-1.5 text-[12px] font-medium text-white/[0.66] md:flex">
                <Clock
                  size={12}
                  strokeWidth={1.5}
                  className="text-white/[0.52]"
                  aria-hidden="true"
                />
                <span className="tabular-nums">{time}</span>
              </div>
            )}

            <a
              href={DISCUSSIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-tag border border-white/[0.12] bg-carbon-black px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-paper-white transition-[background-color,transform] duration-150 hover:bg-black active:scale-95"
            >
              Get in touch
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
}
