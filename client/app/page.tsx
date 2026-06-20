// Placeholder. Sections are built per LANDING_PAGE_SPEC.md after setup is
// confirmed. This intentionally renders the design tokens so the scaffold is
// visually verifiable: marble canvas, Fraunces 300 display, Inter body.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1200px] flex-col items-start justify-center px-6">
      <p className="text-caption font-medium tracking-[0.05em] text-slate-pencil">
        Setup scaffold
      </p>
      <h1 className="mt-6 font-serif text-display-lg font-light leading-[1.05] text-lampblack">
        Verifiable infrastructure for AI guardrails.
      </h1>
      <p className="mt-6 max-w-[720px] text-body leading-[1.6] text-steel">
        Next.js, Tailwind v4 design tokens, and the Fraunces 300 / Inter type
        pairing are wired up. Sections from the spec come next.
      </p>
    </main>
  );
}
