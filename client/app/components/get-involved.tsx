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
    body: "The full research statement, problem framing, and threat model.",
    linkText: "Coming soon →",
    mutedColor: "text-slate-pencil",
  },
  {
    eyebrow: "for researchers",
    heading: "See the benchmark",
    body: "Methodology, prompts, models, and results as they become available.",
    linkText: "In development →",
    mutedColor: "text-steel",
  },
  {
    eyebrow: "for developers",
    heading: "View the repository",
    body: "Source for the landing page and, eventually, the reference implementation.",
    linkText: "github.com/harshedabdulla/consensus-sentry →",
    href: REPO_URL,
  },
  {
    eyebrow: "for collaborators",
    heading: "Start a conversation",
    body: "Research collaboration, faculty advisors, civil society engagement. Open a discussion on GitHub.",
    linkText: "Open a discussion →",
    href: DISCUSSIONS_URL,
  },
];

export function GetInvolved() {
  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="font-serif text-[48px] leading-[1.12] font-light text-lampblack">
          Four ways in.
        </h2>
        <p className="mt-6 max-w-[720px] text-[16px] leading-[1.7] text-steel">
          Whether you read papers, run code, or work on policy, there is
          something here for you.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {blocks.map((block) => (
            <article
              key={block.heading}
              className="rounded-card border border-bone-mist bg-paper-white p-8 transition-colors duration-200 hover:border-fog-line"
            >
              <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-pencil">
                {block.eyebrow}
              </p>
              <h3 className="mt-3 text-heading-sm font-medium text-lampblack">
                {block.heading}
              </h3>
              <p className="mt-4 text-body leading-[1.6] text-steel">
                {block.body}
              </p>
              {block.href ? (
                <a
                  href={block.href}
                  target={block.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    block.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="mt-6 inline-block break-all text-body text-violet-ink underline"
                >
                  {block.linkText}
                </a>
              ) : (
                <span
                  className={`mt-6 inline-block text-body ${block.mutedColor}`}
                >
                  {block.linkText}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
