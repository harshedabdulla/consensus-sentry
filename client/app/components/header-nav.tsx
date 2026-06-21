"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

function NavComingSoon({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        role="link"
        aria-disabled="true"
        tabIndex={0}
        className="cursor-default text-[13px] font-medium text-slate-pencil/60 transition-colors hover:text-slate-pencil"
      >
        {label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-tag border border-bone-mist bg-paper-white px-3 py-1 text-caption whitespace-nowrap text-steel opacity-0 shadow-card transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 z-50"
      >
        Coming soon
      </span>
    </span>
  );
}

export function HeaderNav() {
  const [time, setTime] = useState("");

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
      <header className="mx-auto max-w-[860px] rounded-full border border-bone-mist/80 bg-white/70 px-4 py-2.5 shadow-design-sm backdrop-blur-md md:px-6">
        <nav className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <a
            href="#top"
            className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-lampblack transition-opacity hover:opacity-90"
          >
            <span className="hidden sm:inline">Consensus Sentry</span>
            <span className="sm:hidden text-xs">C. Sentry</span>
          </a>

          {/* Links Section */}
          <div className="flex items-center gap-6 md:gap-8">
            <NavComingSoon label="Research" />
            <NavComingSoon label="Benchmark" />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-steel no-underline transition-colors hover:text-lampblack"
            >
              Repository
            </a>
          </div>

          {/* Clock & Contact CTA */}
          <div className="flex items-center gap-3 md:gap-4">
            {time && (
              <div className="hidden items-center gap-1.5 text-[12px] font-medium text-steel md:flex">
                <Clock size={12} strokeWidth={1.5} className="text-slate-pencil" />
                <span>{time}</span>
              </div>
            )}

            <a
              href={DISCUSSIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-lampblack px-3.5 py-1.5 text-[12px] font-semibold text-paper-white transition-all duration-150 hover:bg-graphite active:scale-95 whitespace-nowrap"
            >
              Get in touch
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
}
