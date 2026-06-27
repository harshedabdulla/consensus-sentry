export function Status() {
  return (
    <section className="px-6 pt-28 md:pt-40">
      <div className="mx-auto max-w-[760px]">
        <h2 className="font-serif text-[42px] leading-[1.10] font-light tracking-[-0.02em] text-balance text-lampblack md:text-[48px]">
          Where we are.
        </h2>
        <p className="mt-6 max-w-[620px] text-[15px] leading-[1.65] text-steel">
          Only the first file is open. What comes after it is still being
          written.
        </p>

        <ol className="mt-14">
          {/* Phase 01 - the one open file. */}
          <li className="grid grid-cols-[12px_1fr] gap-x-5">
            <div className="relative flex justify-center">
              {/* Solid rail under the active node, fading into the dashed tail. */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1 h-full w-px -translate-x-1/2 bg-bone-mist"
              />
              <span className="relative mt-1 grid h-3 w-3 place-items-center">
                <span className="absolute h-3 w-3 rounded-full border border-design-hudson-blue/40 animate-pulse-ring" />
                <span className="h-3 w-3 rounded-full bg-design-hudson-blue" />
              </span>
            </div>

            <div className="pb-10">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-slate-pencil uppercase">
                  Phase 01
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold leading-none text-design-hudson-blue">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-design-hudson-blue"
                  />
                  In progress
                </span>
              </div>
              <h3 className="mt-2 text-[18px] font-medium leading-[1.25] text-lampblack">
                Research statement
              </h3>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-steel">
                The argument, stated in public. This site.
              </p>
            </div>
          </li>

          {/* The tail - deliberately undisclosed. A dashed rail trailing into a
              hollow marker; the rest of the plan is kept under wraps. */}
          <li className="grid grid-cols-[12px_1fr] gap-x-5">
            <div className="relative flex justify-center">
              <span
                aria-hidden="true"
                className="mt-1 h-3 w-3 rounded-full border-2 border-dashed border-bone-mist bg-marble-canvas"
              />
            </div>
            <div className="-mt-0.5">
              <p className="text-[13px] leading-[1.6] text-slate-pencil italic">
                The next phases exist. We&rsquo;re not showing the map yet.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
