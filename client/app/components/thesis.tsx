// Centered editorial thesis statement - the GIC "mission statement" beat,
// placed right after the hero. Large display serif treated as a headline (so
// the centered alignment is allowed under CLAUDE.md), carrying the project's
// core claim with two inline blue links into the rest of the page.

const HEADLINE_LINK =
  "text-violet-ink underline decoration-1 underline-offset-[3px] decoration-violet-ink/40 transition-colors hover:decoration-violet-ink";

export function Thesis() {
  return (
    <section className="px-6 pt-20 md:pt-28">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="font-serif text-[28px] leading-[1.25] font-light tracking-[-0.02em] text-pretty text-lampblack md:text-[34px]">
          Every AI moderation decision should carry proof: which rule fired, who
          authored it, and whether the same question was treated the same way.
          Then bias can be{" "}
          <a href="#demo" className={HEADLINE_LINK}>
            measured
          </a>
          , audited, and{" "}
          <a href="#contributions" className={HEADLINE_LINK}>
            contested
          </a>
          , even when it cannot be eliminated.
        </p>
      </div>
    </section>
  );
}
