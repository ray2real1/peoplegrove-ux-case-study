'use client';

/**
 * Read-only proof viewer for the Catch / SafeOps Object Model v1.2.
 *
 * Strictly read-only: it SELECTS from existing seed reports and DERIVES views
 * from the model layer. There are no create/edit/delete or any mutation
 * controls. Every dynamic value is computed by the model's pure functions.
 */

import { useMemo, useState } from 'react';
import type {
  ActivityEvent,
  Consequence,
  Likelihood,
  Report,
  RiskBand,
} from '@/types';
import { seedReportAggregates } from '@/data/seedReports';
import { deriveReportProjection } from '@/lib/projections';
import { deriveAggregateSyncState } from '@/lib/sync';
import { SEVERITY_MATRIX, SLA_HOURS } from '@/lib/severity';
import { generateExportRecord } from '@/lib/exports';
import { anonymousLifecycle } from './demos';

/* ------------------------------------------------------------------ */
/* small helpers                                                      */
/* ------------------------------------------------------------------ */

const NULL = 'null';
const fmt = (v: string | null | undefined): string =>
  v === null || v === undefined ? NULL : v;

const LIKELIHOODS: Likelihood[] = ['likely', 'possible', 'rare'];
const CONSEQUENCES: Consequence[] = [
  'minor',
  'serious',
  'severe',
  'catastrophic',
];
const BANDS: RiskBand[] = ['critical', 'high', 'medium', 'low'];

function bandClasses(band: RiskBand): string {
  switch (band) {
    case 'critical':
      return 'bg-rose-500/15 text-rose-200 border-rose-400/30';
    case 'high':
      return 'bg-amber-500/15 text-amber-100 border-amber-400/30';
    case 'medium':
      return 'bg-sky-500/15 text-sky-100 border-sky-400/30';
    case 'low':
    default:
      return 'bg-slate-500/15 text-slate-200 border-slate-400/30';
  }
}

const projectionFields = (r: Report): Array<[string, string]> => [
  ['report id', r.id],
  ['currentStatus', r.currentStatus],
  ['currentAssigneeId', fmt(r.currentAssigneeId)],
  ['currentSeverityAssessmentId', fmt(r.currentSeverityAssessmentId)],
  ['currentSlaDueAt', fmt(r.currentSlaDueAt)],
  ['mergedIntoReportId', fmt(r.mergedIntoReportId)],
];

/* ------------------------------------------------------------------ */
/* presentational primitives                                          */
/* ------------------------------------------------------------------ */

function Section(props: {
  id: string;
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={props.id}
      aria-labelledby={`${props.id}-h`}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <h2
        id={`${props.id}-h`}
        className="text-lg sm:text-xl font-semibold text-white"
      >
        <span className="text-sky-300/80 tabular-nums">
          {String(props.step).padStart(2, '0')}
        </span>{' '}
        {props.title}
      </h2>
      <div className="mt-4 space-y-4 text-sm text-slate-200">
        {props.children}
      </div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-2 text-[0.8rem] text-sky-100">
      {children}
    </p>
  );
}

function KeyValue({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="bg-[#0b1020] px-3 py-2">
          <dt className="text-[0.7rem] uppercase tracking-wide text-slate-400">
            {k}
          </dt>
          <dd className="mt-0.5 break-all font-mono text-[0.82rem] text-slate-100">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Scroll({ children }: { children: React.ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* main viewer                                                        */
/* ------------------------------------------------------------------ */

export default function CatchModelViewer() {
  const aggregates = seedReportAggregates;
  const [selectedId, setSelectedId] = useState(aggregates[0].report.id);

  const selected = useMemo(
    () =>
      aggregates.find((a) => a.report.id === selectedId) ?? aggregates[0],
    [aggregates, selectedId],
  );

  const view = useMemo(() => {
    const { report, events, evidence, severityAssessments } = selected;

    const projection = deriveReportProjection(report, events);
    const aggregateSync = deriveAggregateSyncState([
      report,
      ...evidence,
      ...events,
      ...severityAssessments,
    ]);
    const timeline = [...events].sort((a, b) =>
      a.occurredAt < b.occurredAt ? -1 : a.occurredAt > b.occurredAt ? 1 : 0,
    );
    const replay = timeline.map((event, i) => ({
      step: i + 1,
      event,
      projection: deriveReportProjection(report, timeline.slice(0, i + 1)),
    }));

    // Stale-projection correction (in-memory only).
    const corrupted: Report = {
      ...report,
      currentStatus: 'closed',
      currentAssigneeId: 'WRONG',
      currentSlaDueAt: '1999-01-01T00:00:00.000Z',
    };
    const corrected = deriveReportProjection(corrupted, events);

    const exportRecord = generateExportRecord(report, events, {
      exportId: `exp_view_${report.id}`,
      now: report.createdAt,
    });

    return {
      projection,
      aggregateSync,
      timeline,
      replay,
      corrupted,
      corrected,
      exportRecord,
    };
  }, [selected]);

  const anonSeed = useMemo(
    () => aggregates.find((a) => a.report.isAnonymous) ?? null,
    [aggregates],
  );
  const anonSeedExport = useMemo(
    () =>
      anonSeed
        ? generateExportRecord(anonSeed.report, anonSeed.events, {
            exportId: `exp_anon_${anonSeed.report.id}`,
            now: anonSeed.report.createdAt,
          })
        : null,
    [anonSeed],
  );

  return (
    <main
      id="top"
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-6"
    >
      <header className="space-y-2">
        <p className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-sky-300/70">
          Internal lab · not linked from navigation
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Catch / SafeOps — Model Proof Viewer
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          A read-only view that proves the Object Model v1.2 works: the event
          log is the source of truth, current state is rebuilt from it, and the
          claim-safety boundaries are enforced in the model — not painted on in
          the UI.
        </p>
      </header>

      {/* 1. Boundary banner ------------------------------------------------ */}
      <Section id="boundaries" step={1} title="Prototype boundaries are built into the model">
        <ul className="flex flex-wrap gap-2">
          {[
            'Local-only',
            'Simulated sync',
            'Simulated immutable record',
            'Illustrative severity only',
            'No emergency dispatch',
            'No compliance certification',
            'No real PII',
          ].map((b) => (
            <li
              key={b}
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[0.78rem] text-slate-100"
            >
              {b}
            </li>
          ))}
        </ul>
        <Note>
          Temporary lab route. Catch/SafeOps is intended to be extracted into a
          dedicated <code>catch-safeops-prototype</code> repo before any public
          portfolio URL or case-study copy references the repo path.
        </Note>
      </Section>

      {/* 2. Seed selector -------------------------------------------------- */}
      <Section id="selector" step={2} title="Choose a seed report">
        <label htmlFor="seed-select" className="block text-slate-300">
          Seed report (read-only — no create, edit, or delete)
        </label>
        <select
          id="seed-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#0b1020] px-3 py-2 text-slate-100"
        >
          {aggregates.map((a) => (
            <option key={a.report.id} value={a.report.id}>
              {a.report.title}
              {a.report.isAnonymous ? ' · anonymous' : ''} ({a.report.id})
            </option>
          ))}
        </select>
        <p className="text-[0.78rem] text-slate-400">
          Selecting only changes which derived view is shown. No model state is
          mutated.
        </p>
      </Section>

      {/* 3. Derived projection -------------------------------------------- */}
      <Section id="projection" step={3} title="Current state is rebuilt from the event log">
        <KeyValue rows={projectionFields(view.projection)} />
        <KeyValue
          rows={[
            ['aggregate sync state', view.aggregateSync.state],
            [
              'synced / queued / local',
              `${view.aggregateSync.synced} / ${view.aggregateSync.queued} / ${view.aggregateSync.local}`,
            ],
          ]}
        />
      </Section>

      {/* 4. Timeline ------------------------------------------------------- */}
      <Section id="timeline" step={4} title="The record is the source of truth">
        <p className="font-medium text-white">
          ActivityEvent is the append-only source of truth.
        </p>
        <Scroll>
          <table className="w-full min-w-[44rem] border-collapse text-left text-[0.78rem]">
            <thead>
              <tr className="text-slate-400">
                {['type', 'actor role', 'actor id', 'field', 'before', 'after', 'reason', 'occurredAt'].map(
                  (h) => (
                    <th key={h} scope="col" className="border-b border-white/10 px-2 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="font-mono text-slate-200">
              {view.timeline.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="border-b border-white/5 px-2 py-1.5 text-sky-200">{e.type}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{e.actorRole}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(e.actorId)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(e.field)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(e.before)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(e.after)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(e.reason)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5 whitespace-nowrap">{e.occurredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
      </Section>

      {/* 5. Replay step-through ------------------------------------------- */}
      <Section id="replay" step={5} title="Replay shows how truth is rebuilt">
        <Scroll>
          <table className="w-full min-w-[48rem] border-collapse text-left text-[0.78rem]">
            <thead>
              <tr className="text-slate-400">
                {['#', 'event applied', 'currentStatus', 'currentAssigneeId', 'currentSeverityAssessmentId', 'currentSlaDueAt', 'mergedIntoReportId'].map(
                  (h) => (
                    <th key={h} scope="col" className="border-b border-white/10 px-2 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="font-mono text-slate-200">
              {view.replay.map(({ step, event, projection }) => (
                <tr key={event.id} className="align-top">
                  <td className="border-b border-white/5 px-2 py-1.5 tabular-nums">{step}</td>
                  <td className="border-b border-white/5 px-2 py-1.5 text-sky-200">{event.type}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{projection.currentStatus}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(projection.currentAssigneeId)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(projection.currentSeverityAssessmentId)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5 whitespace-nowrap">{fmt(projection.currentSlaDueAt)}</td>
                  <td className="border-b border-white/5 px-2 py-1.5">{fmt(projection.mergedIntoReportId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
        <p className="text-slate-300">
          Each row shows the report projection after replaying events up to that
          point.
        </p>
      </Section>

      {/* 6. Stale correction ---------------------------------------------- */}
      <Section id="stale" step={6} title="Wrong cached state gets corrected">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-rose-300">
              Before — corrupted cache
            </h3>
            <KeyValue
              rows={[
                ['currentStatus', view.corrupted.currentStatus],
                ['currentAssigneeId', fmt(view.corrupted.currentAssigneeId)],
                ['currentSlaDueAt', fmt(view.corrupted.currentSlaDueAt)],
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-emerald-300">
              After replay — authoritative
            </h3>
            <KeyValue
              rows={[
                ['currentStatus', view.corrected.currentStatus],
                ['currentAssigneeId', fmt(view.corrected.currentAssigneeId)],
                ['currentSlaDueAt', fmt(view.corrected.currentSlaDueAt)],
              ]}
            />
          </div>
        </div>
        <p className="text-slate-300">
          We injected a wrong cached state. Replaying ActivityEvents restores
          the authoritative state.
        </p>
      </Section>

      {/* 7. Severity matrix ----------------------------------------------- */}
      <Section id="severity" step={7} title="Severity supports judgment; it does not certify risk">
        <Scroll>
          <table className="w-full min-w-[34rem] border-collapse text-center text-[0.8rem]">
            <caption className="sr-only">
              Locked 3 by 4 likelihood by consequence severity matrix
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border border-white/10 px-2 py-2 text-left text-slate-400">
                  likelihood \ consequence
                </th>
                {CONSEQUENCES.map((c) => (
                  <th key={c} scope="col" className="border border-white/10 px-2 py-2 text-slate-200">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIKELIHOODS.map((l) => (
                <tr key={l}>
                  <th scope="row" className="border border-white/10 px-2 py-2 text-left text-slate-200">
                    {l}
                  </th>
                  {CONSEQUENCES.map((c) => {
                    const band = SEVERITY_MATRIX[l][c];
                    return (
                      <td key={c} className="border border-white/10 px-2 py-2">
                        <span className={`inline-block rounded-md border px-2 py-0.5 font-mono ${bandClasses(band)}`}>
                          {band}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>

        <div>
          <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-slate-400">
            SLA mapping by risk band
          </h3>
          <KeyValue
            rows={BANDS.map((b) => [
              b,
              `${SLA_HOURS[b]} hour${SLA_HOURS[b] === 1 ? '' : 's'}`,
            ])}
          />
        </div>
        <p className="text-slate-300">
          Illustrative decision-support model, not a certified risk methodology.
        </p>
      </Section>

      {/* 8. Anonymous proof ----------------------------------------------- */}
      <Section id="anonymous" step={8} title="Anonymous is enforced, not hidden">
        {anonSeed && anonSeedExport ? (
          <>
            <KeyValue
              rows={[
                ['seed report id', anonSeed.report.id],
                ['Report.reporterId', fmt(anonSeed.report.reporterId)],
                ['export snapshot.reporterId', anonSeedExport.snapshot.reporterId],
              ]}
            />
            <div>
              <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-slate-400">
                Reporter-role ActivityEvents (actor id is null)
              </h3>
              <KeyValue
                rows={anonSeed.events
                  .filter((e) => e.actorRole === 'reporter')
                  .map((e) => [e.type, `actorId = ${fmt(e.actorId)}`])}
              />
            </div>
          </>
        ) : null}

        <div>
          <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-slate-400">
            Full anonymous lifecycle (creation → evidence → triage → assignment
            → severity review → export)
          </h3>
          <p className="mb-2 text-[0.78rem] text-slate-400">
            Built in this viewer by feeding a fake reporter identity (
            <code className="break-all">{anonymousLifecycle.secret}</code>) into
            every command. It must never persist.
          </p>
          <Scroll>
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.78rem]">
              <thead>
                <tr className="text-slate-400">
                  {['stage', 'event type', 'actor role', 'actor id', 'occurredAt'].map((h) => (
                    <th key={h} scope="col" className="border-b border-white/10 px-2 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-slate-200">
                {anonymousLifecycle.stages.map((s, i) => (
                  <tr key={`${s.eventType}-${i}`}>
                    <td className="border-b border-white/5 px-2 py-1.5">{s.label}</td>
                    <td className="border-b border-white/5 px-2 py-1.5 text-sky-200">{s.eventType}</td>
                    <td className="border-b border-white/5 px-2 py-1.5">{s.actorRole}</td>
                    <td className="border-b border-white/5 px-2 py-1.5">{fmt(s.actorId)}</td>
                    <td className="border-b border-white/5 px-2 py-1.5 whitespace-nowrap">{s.occurredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
          <p className="mt-2 text-[0.8rem]">
            <span
              className={`rounded-md border px-2 py-0.5 font-mono ${
                anonymousLifecycle.secretLeaked
                  ? 'border-rose-400/30 bg-rose-500/15 text-rose-200'
                  : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
              }`}
            >
              secret leaked across lifecycle: {String(anonymousLifecycle.secretLeaked)}
            </span>
          </p>
        </div>
        <p className="text-slate-300">
          Anonymous reporting removes identity from the record layer, not just
          from the UI.
        </p>
      </Section>

      {/* 9. Export preview ------------------------------------------------- */}
      <Section id="export" step={9} title="Export is local-only">
        <KeyValue
          rows={[
            ['isLocalOnly', String(view.exportRecord.isLocalOnly)],
            ['carries SyncMeta', String('syncMeta' in view.exportRecord)],
            ['format', view.exportRecord.format],
            ['generatedAt', view.exportRecord.generatedAt],
          ]}
        />
        <div>
          <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wide text-slate-400">
            snapshot fields
          </h3>
          <KeyValue
            rows={Object.entries(view.exportRecord.snapshot).map(([k, v]) => [
              k,
              v,
            ])}
          />
        </div>
        <p className="text-[0.8rem] text-slate-400">
          {selected.report.isAnonymous
            ? 'Selected report is anonymous → snapshot.reporterId is null.'
            : 'Selected report is attributed → reporterId is present in the snapshot, but no SyncMeta is ever attached.'}
        </p>
      </Section>

      <footer className="pt-2 text-[0.72rem] text-slate-500">
        Read-only model proof · Catch / SafeOps Object Model v1.2 · temporary
        lab route, see tracking issue #4.
      </footer>
    </main>
  );
}
