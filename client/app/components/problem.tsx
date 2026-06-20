export function Problem() {
  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[720px]">
        <h2 className="font-serif text-[48px] leading-[1.12] font-light text-lampblack">
          Principles exist. Infrastructure does not.
        </h2>

        <div className="mt-10 space-y-7 text-[16px] leading-[1.7] text-steel">
          <p>
            Every day, AI systems refuse questions, hedge on contested topics,
            and treat two equivalent queries differently. These are moderation
            decisions, but they are invisible. There is no mechanism for
            the person affected, or anyone else, to verify which rule was
            applied, who authored it, when it last changed, or whether other
            people were treated the same way.
          </p>
          <p>
            Governments have begun writing the principles down. India&rsquo;s AI
            Governance Guidelines (MeitY, November 2025) name Transparency,
            Accountability, and &ldquo;Understandable by Design&rdquo;; other
            jurisdictions are converging on the same ground. The principles are
            sound. The technical means to enforce, audit, or contest them in
            practice do not yet exist.
          </p>
          <p>
            The bias is real and measurable. The accountability layer is not.
            This project builds that layer.
          </p>
        </div>
      </div>
    </section>
  );
}
