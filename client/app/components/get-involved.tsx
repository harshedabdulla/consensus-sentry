import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "./ui/reveal";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

type Block = {
  eyebrow: string;
  heading: string;
  body: string;
  linkText: string;
  href?: string;
  /** When there's no destination yet, show this as a muted status instead. */
  status?: string;
};

const blocks: Block[] = [
  {
    eyebrow: "for readers",
    heading: "Read the research",
    body: "The first public note: the argument, in full.",
    linkText: "Read the research",
    status: "Coming soon",
  },
  {
    eyebrow: "for researchers",
    heading: "See the benchmark",
    body: "The comparison set, still forming.",
    linkText: "See the benchmark",
    status: "In development",
  },
  {
    eyebrow: "for developers",
    heading: "View the repository",
    body: "The workbench: code, issues, and the build in the open.",
    linkText: "github.com/harshedabdulla/consensus-sentry",
    href: REPO_URL,
  },
  {
    eyebrow: "for collaborators",
    heading: "Start a conversation",
    body: "For people who see the gap too.",
    linkText: "Open a discussion",
    href: DISCUSSIONS_URL,
  },
];

export function GetInvolved() {
  return (
    <section className="px-6 pt-20 md:pt-28">
      <div className="mx-auto max-w-[820px]">
        <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-balance text-lampblack md:text-[48px]">
          Four ways in.
        </h2>
        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          A few doors. Most of the building is still quiet.
        </p>

        {/* A directory of interactive rows - the whole row is the affordance.
            Live entries carry an arrow that slides on hover; entries without a
            destination yet show a muted status instead. Deliberately unlike the
            principles list and the numbered contributions above it. */}
        <div className="mt-12 flex flex-col">
          {blocks.map((block, i) => {
            const isExternal = block.href?.startsWith("http");
            const Arrow = isExternal ? ArrowUpRight : ArrowRight;

            const inner = (
              <div
                className={`grid grid-cols-[1fr_auto] items-center gap-x-6 py-7 md:gap-x-10 ${
                  i === 0 ? "" : "border-t border-bone-mist/60"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil uppercase">
                    {block.eyebrow}
                  </p>
                  <h3 className="mt-2 text-[20px] font-medium leading-[1.2] text-lampblack transition-colors group-hover:text-design-hudson-blue">
                    {block.heading}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-steel">
                    {block.body}
                  </p>
                  {block.href && (
                    <span className="mt-3 inline-block break-all text-[12px] text-slate-pencil">
                      {block.linkText}
                    </span>
                  )}
                </div>

                {block.href ? (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone-mist text-lampblack transition-[background-color,border-color,color] duration-300 group-hover:border-design-hudson-blue group-hover:bg-design-hudson-blue group-hover:text-paper-white">
                    <Arrow size={17} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="shrink-0 text-[12px] font-semibold whitespace-nowrap text-slate-pencil">
                    {block.status}
                  </span>
                )}
              </div>
            );

            return (
              <Reveal key={block.heading} delay={i * 80}>
                {block.href ? (
                  <a
                    href={block.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group block transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="group">{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
