# PeopleGrove Opportunity Discovery & Tracking

Premium UX internship case study microsite built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```

## Notes

- The case study PDF is available at `/docs/Opportunity Command Center — UX System & Screens-3.pdf`.
- The Figma CTA links to the approved prototype file.
 The site copy intentionally avoids implementation, launch, adoption, and metric claims.

---

# Catch / SafeOps Object Model — v1.2

A TypeScript domain-model layer for **Catch** (repo namespace `goodcatch`), a
near-miss / hazard capture concept. This is the **model layer only** — no UI is
built on it yet.

## Prototype boundary statement

> **Catch is a portfolio prototype and demo artifact, not a production EHS or
> safety system.** Every claim-safety boundary below is enforced by the model:
>
> - **Local-only data** — there is no backend; nothing leaves the device.
> - **Simulated sync** — every `SyncMeta` carries `isSimulated: true`; "synced"
>   only ever means a local record moved between simulated states.
> - **Simulated immutable record** — the `ActivityEvent` log is append-only and
>   every event is frozen on creation.
> - **Illustrative severity model only** — every `SeverityAssessment` carries
>   `modelVersion: 'catch-demo-severity-v1'` and `isIllustrative: true`. It is a
>   deliberately small demo grid, **not** a validated or certified risk
>   methodology.
> - **No emergency dispatch** — Catch never positions itself as emergency
>   response. Active emergencies follow your site's emergency procedures.
> - **No compliance certification** — this model certifies nothing.
> - **No real PII** — anonymous reports store **no** reporter identity anywhere
>   in the report, event log, evidence, severity review, or export, across the
>   entire lifecycle.

## Layout

| Path | Responsibility |
| --- | --- |
| `types/index.ts` | All domain types and the core invariant documentation. |
| `lib/severity.ts` | Locked illustrative severity matrix + SLA mapping. |
| `lib/audit.ts` | `ActivityEvent` creation (frozen), deterministic serialization, append. |
| `lib/sync.ts` | Simulated, local-only sync state + aggregate roll-up. |
| `lib/projections.ts` | Rebuild `current*` caches purely from the event log. |
| `lib/workflow.ts` | Pure command functions that return `ActivityEvent`s. |
| `lib/exports.ts` | Local-only `ExportRecord` (never carries `SyncMeta`). |
| `data/*.ts` | ConfigPack, Zone, HazardType lookups and seed reports. |
| `tests/model.test.ts` | Model-layer test suite. |

## Core invariants

1. `ActivityEvent` is the source of truth.
2. `Report.current*` fields are projections / caches only.
3. No command mutates projection fields directly.
4. Command functions return `ActivityEvent`s.
5. `deriveReportProjection()` rebuilds current state from events.
6. Every consequential change writes an `ActivityEvent`.
7. `SeverityAssessment` is always illustrative (`catch-demo-severity-v1`).
8. `SyncMeta` exists per Report, Evidence, ActivityEvent, SeverityAssessment.
9. `ExportRecord` is local-only and carries no `SyncMeta`.
10. Zone and HazardType are configurable lookups tied to a `ConfigPack`.
11. No hard delete — `void`, `merge`, `withdraw`, `retain-with-reason` only.
12. Anonymous reports store no reporter identity in Report or ActivityEvent.
13. Anonymous reports stay identity-free across the full lifecycle.
14. Merge is non-destructive (survivor gets a reference event only).
15. `ActivityEvent` `before`/`after` are deterministic strings.
16. Severity override is restricted to triager / manager / auditor.

## Verify the model layer

```bash
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
```
