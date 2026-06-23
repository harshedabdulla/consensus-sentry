import { Reveal } from "./ui/reveal";

const REPO_URL = "https://github.com/harshedabdulla/consensus-sentry";
const DISCUSSIONS_URL = `${REPO_URL}/discussions`;

type Block = {
  eyebrow: string;
  heading: string;
  body: string;
  linkText: string;
  href?: string;
  /** Tailwind text-color class for non-live links. */
  mutedColor?: string;
};

const blocks: Block[] = [
  {
    eyebrow: "for readers",
    heading: "Read the research",
    body: "The first public note.",
    linkText: "Coming soon",
    mutedColor: "text-slate-pencil/60",
  },
  {
    eyebrow: "for researchers",
    heading: "See the benchmark",
    body: "The comparison set, still forming.",
    linkText: "In development",
    mutedColor: "text-steel/70",
  },
  {
    eyebrow: "for developers",
    heading: "View the repository",
    body: "The workbench.",
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
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-lampblack md:text-[48px]">
          Four ways in.
        </h2>
        <p className="mt-6 max-w-[720px] text-[15px] leading-[1.65] text-steel">
          A few doors. Most of the building is still quiet.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {blocks.map((block, i) => (
            <Reveal key={block.heading} delay={i * 100} className="h-full">
              <article
                className="group flex h-full flex-col rounded-card border border-bone-mist/60 bg-paper-white p-8 shadow-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-bone-mist/90 hover:shadow-elevated"
              >
                <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil uppercase">
                  {block.eyebrow}
                </p>
                <h3 className="mt-3 text-heading-sm font-medium text-lampblack">
                  {block.heading}
                </h3>
                <p className="mt-4 flex-1 text-[13.5px] leading-[1.6] text-steel">
                  {block.body}
                </p>
                <div className="mt-6">
                  {block.href ? (
                    <a
                      href={block.href}
                      target={block.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        block.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-block break-all text-[13px] font-semibold text-violet-ink underline transition-transform group-hover:translate-x-0.5"
                    >
                      {block.linkText}
                    </a>
                  ) : (
                    <span
                      className={`inline-block text-[13px] font-medium ${block.mutedColor}`}
                    >
                      {block.linkText}
                    </span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
