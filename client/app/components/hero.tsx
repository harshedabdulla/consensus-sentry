import { PillButton } from "./ui/pill-button";
import { GlyphWallpaper } from "./ui/glyph-wallpaper";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const HERO_BACKGROUND = "/hero-bg-2.jpg";

export function Hero() {
  return (
    <section 
      className="relative flex min-h-screen w-full items-end justify-start overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-16 md:px-12 md:py-24" 
      style={{ backgroundImage: `url('${HERO_BACKGROUND}')` }}
      id="top"
    >
      <div className="absolute inset-0 bg-black/[0.42]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_78%,rgba(46,196,182,0.24),transparent_34%),linear-gradient(90deg,rgba(1,22,39,0.3),transparent_58%)]" />

      <div className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[24px] border border-white/15 bg-design-graphite-night/[0.55] p-6 shadow-elevated backdrop-blur-md transition-all duration-500 ease-out md:p-12 cs-fade-in md:ml-4">
        <GlyphWallpaper variant="surface" className="opacity-[0.18] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(46,196,182,0.2),rgba(253,255,252,0.06)_42%,rgba(1,22,39,0.22))]" />
        <div className="relative">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-white/70 uppercase">
          A research project on AI accountability infrastructure
        </p>

        <h1 className="mt-4 font-serif text-[36px] font-light leading-[1.10] tracking-[-0.02em] text-white md:text-[54px]">
          Verifiable infrastructure for AI guardrails.
        </h1>

        <p className="mt-4 font-serif text-[18px] font-light leading-[1.3] text-white/95 md:text-[22px]">
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

        <p className="mt-6 text-[12px] text-white/60">
          Early-stage research · Phase 1 in progress
        </p>
        </div>
      </div>
    </section>
  );
}
