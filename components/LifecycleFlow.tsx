import { screens } from "@/content/caseStudy";

export function LifecycleFlow() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
      {screens.map((screen, index) => (
        <li
          key={screen.label}
          className="relative rounded-2xl border border-white/10 bg-white/[0.045] p-4"
        >
          <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky text-sm font-bold text-ink">
            {screen.step}
          </span>
          <p className="text-sm font-semibold text-white">{screen.label}</p>
          <p className="mt-1 text-xs leading-5 text-ice/55">
            &ldquo;{screen.decision}&rdquo;
          </p>
          {index < screens.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 top-9 hidden h-px w-4 bg-sky/45 lg:block"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
