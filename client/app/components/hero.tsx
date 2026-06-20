import { PillButton } from "./ui/pill-button";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";

export function Hero() {
  return (
    <section className="px-6 pt-32 pb-24 md:pt-44 md:pb-32" id="top">
      <div className="mx-auto flex max-w-[880px] flex-col items-center text-center">
        <p className="text-caption font-medium tracking-[0.05em] text-slate-pencil">
          A research project on AI accountability infrastructure
        </p>

        <h1 className="mt-8 font-serif text-[48px] leading-[1.05] font-light text-lampblack md:text-[80px]">
          Verifiable infrastructure for AI guardrails.
        </h1>

        <p className="mt-8 font-serif text-[24px] leading-[1.2] font-light text-steel md:text-[32px]">
          So that every AI moderation decision can be measured, audited, and
          contested, not taken on trust.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <PillButton variant="primary" comingSoonTooltip="Coming soon">
            Read the research
          </PillButton>
          <PillButton
            variant="ghost"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </PillButton>
        </div>

        <p className="mt-8 text-caption text-slate-pencil">
          Early-stage research · Phase 1 in progress
        </p>
      </div>
    </section>
  );
}
