import { screenResponsibilities } from "@/content/caseStudy";

export function ScreenResponsibilityMatrix() {
  return (
    <div>
      {/* Desktop: compact table */}
      <div className="hidden overflow-hidden rounded-3xl border border-white/10 md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Each prototype screen mapped to its primary job, the decision it
            supports, and the UX risk it reduces.
          </caption>
          <thead>
            <tr className="bg-white/[0.04] text-[0.7rem] uppercase tracking-[0.16em] text-ice/55">
              <th scope="col" className="px-5 py-4 font-semibold">
                Screen
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Primary job
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Decision supported
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                UX risk reduced
              </th>
            </tr>
          </thead>
          <tbody>
            {screenResponsibilities.map((row) => (
              <tr
                key={row.screen}
                className="border-t border-white/10 transition hover:bg-white/[0.03]"
              >
                <th
                  scope="row"
                  className="px-5 py-4 text-sm font-semibold text-white"
                >
                  {row.screen}
                </th>
                <td className="px-5 py-4 text-sm text-ice/75">{row.job}</td>
                <td className="px-5 py-4 text-sm text-ice/75">
                  &ldquo;{row.decision}&rdquo;
                </td>
                <td className="px-5 py-4 text-sm font-medium text-mint">
                  {row.risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="grid gap-3 md:hidden">
        {screenResponsibilities.map((row) => (
          <li
            key={row.screen}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"
          >
            <p className="text-sm font-semibold text-white">{row.screen}</p>
            <dl className="mt-3 grid gap-2.5">
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ice/70">
                  Primary job
                </dt>
                <dd className="mt-0.5 text-sm text-ice/80">{row.job}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ice/70">
                  Decision supported
                </dt>
                <dd className="mt-0.5 text-sm text-ice/80">
                  &ldquo;{row.decision}&rdquo;
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ice/70">
                  UX risk reduced
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-mint">
                  {row.risk}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
