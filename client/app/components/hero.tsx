import { PillButton } from "./ui/pill-button";
import { ParallaxBg } from "./ui/parallax-bg";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const HERO_BACKGROUND = "/hero-bg-2.jpg";

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100dvh] w-full items-end justify-start overflow-hidden px-4 py-16 md:px-12 md:py-24"
      id="top"
    >
      <ParallaxBg src={HERO_BACKGROUND} />
      <div className="absolute inset-0 bg-black/[0.42]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_78%,rgba(216,158,96,0.30),transparent_34%),linear-gradient(90deg,rgba(36,26,16,0.32),transparent_58%)]" />

      <div className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[24px] border border-white/15 bg-design-graphite-night/[0.55] p-6 shadow-elevated backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-out md:p-12 cs-fade-in md:ml-4">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(216,158,96,0.20),rgba(253,247,241,0.06)_42%,rgba(36,26,16,0.24))]" />
        <div className="relative">
        <p className="text-[11px] font-semibold tracking-[0.1em] text-white/70 uppercase">
          A research project on AI accountability infrastructure
        </p>

        <h1 className="mt-4 font-serif text-[36px] font-light leading-[1.10] tracking-[-0.02em] text-balance text-white md:text-[54px]">
          Verifiable infrastructure for AI guardrails.
        </h1>

        <p className="mt-4 font-serif text-[18px] font-light leading-[1.3] text-white/95 md:text-[20px]">
          Every refusal leaves a trace.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PillButton 
            variant="primary" 
            comingSoonTooltip="Coming soon"
            className="!bg-white !text-design-graphite-night hover:!bg-white/90 border-transparent shadow-none"
          >
            Read the research
          </PillButton>
          <PillButton
            variant="ghost"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="!bg-white/5 !text-white !border-white/30 hover:!bg-white/10"
          >
            View on GitHub
          </PillButton>
        </div>
        </div>
      </div>
    </section>
  );
}
