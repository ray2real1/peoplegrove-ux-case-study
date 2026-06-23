import { opportunityLoop } from "@/content/caseStudy";

function Connector() {
  // Sits in the grid gap: points down when stacked, right when laid out horizontally.
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-sky/50 lg:-right-4 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-x-0 lg:-translate-y-1/2"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 rotate-90 lg:rotate-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

export function OpportunityLoop() {
  return (
    <div>
      <ol className="relative grid gap-4 lg:grid-cols-4 lg:gap-6">
        {opportunityLoop.map((stage, index) => (
          <li key={stage.label} className="relative min-w-0">
            <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition hover:border-sky/30">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sky text-sm font-bold text-ink">
                  {stage.index}
                </span>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                  {stage.label}
                </h3>
              </div>

              <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ice/50">
                User question
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-6 text-white">
                &ldquo;{stage.question}&rdquo;
              </p>

              <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ice/50">
                UX decision
              </p>
              <p className="mt-1.5 text-sm leading-6 text-ice/[0.72]">
                {stage.decision}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                {stage.screens.map((screen) => (
                  <span
                    key={screen}
                    className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-ice/75"
                  >
                    {screen}
                  </span>
                ))}
              </div>
            </article>

            {index < opportunityLoop.length - 1 && <Connector />}
          </li>
        ))}
      </ol>

      <p className="mt-6 flex items-center gap-2 text-xs font-medium text-ice/55">
        <span aria-hidden="true" className="h-px w-6 bg-sky/50" />
        Track feeds back into Discover — the journey is a loop, not a dead end.
      </p>
    </div>
  );
}
