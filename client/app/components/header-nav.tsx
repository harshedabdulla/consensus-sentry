"use client";

import { useEffect, useState } from "react";
import { PillButton } from "./ui/pill-button";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

function NavComingSoon({ label }: { label: string }) {
  return (
    <span className="group relative inline-flex">
      <span
        role="link"
        aria-disabled="true"
        tabIndex={0}
        className="cursor-default text-body text-slate-pencil"
      >
        {label}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-tag border border-bone-mist bg-paper-white px-3 py-1 text-caption whitespace-nowrap text-steel opacity-0 shadow-[var(--shadow-card)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Coming soon
      </span>
    </span>
  );
}

export function HeaderNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-marble-canvas/80 backdrop-blur-sm transition-colors ${
        scrolled ? "border-b border-bone-mist" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <a
          href="#top"
          className="text-base font-medium text-lampblack no-underline"
        >
          Consensus Sentry
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <NavComingSoon label="Research" />
          <NavComingSoon label="Benchmark" />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body text-lampblack no-underline decoration-fog-line underline-offset-4 transition-colors hover:text-steel hover:underline"
          >
            Repository
          </a>
        </div>

        <PillButton
          variant="ghost"
          href={DISCUSSIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get in touch
        </PillButton>
      </nav>
    </header>
  );
}
