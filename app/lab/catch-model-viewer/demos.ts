/**
 * Local-only, deterministic demonstrations built ON TOP of the Catch /
 * SafeOps model layer for the read-only proof viewer.
 *
 * Nothing here mutates anything: every value is computed once at module load
 * by replaying the same pure command functions the model ships with, using
 * fully explicit ids / timestamps so server and client renders match.
 *
 * This file is viewer scaffolding — it does NOT change any model invariant.
 */

import type {
  ActivityEvent,
  ExportRecord,
  Report,
} from '@/types';
import { defaultConfigPack } from '@/data/configPacks';
import { zones } from '@/data/zones';
import { hazardTypes } from '@/data/hazardTypes';
import {
  createReport,
  addEvidence,
  changeStatus,
  assignReport,
  setSeverity,
  overrideSeverity,
} from '@/lib/workflow';
import { deriveReportProjection } from '@/lib/projections';
import { generateExportRecord } from '@/lib/exports';

/**
 * A clearly-marked fake "reporter identity" that we deliberately feed into
 * every anonymous command. If anonymity were merely a UI concern, this string
 * would leak into the event log or export — the proof is that it never does.
 */
export const ANON_SECRET = 'SECRET_REPORTER_PII_should_never_persist';

export interface LifecycleStage {
  label: string;
  eventType: string;
  actorRole: string;
  actorId: string | null;
  occurredAt: string;
}

export interface AnonymousLifecycleDemo {
  secret: string;
  report: Report;
  projection: Report;
  events: ActivityEvent[];
  exportRecord: ExportRecord;
  stages: LifecycleStage[];
  /** True only if the secret leaked anywhere — expected to be false. */
  secretLeaked: boolean;
}

function buildAnonymousLifecycle(): AnonymousLifecycleDemo {
  const zone = zones.find((z) => z.id === 'zone_control_room')!;
  const hazard = hazardTypes.find((h) => h.id === 'haz_pinch_point')!;
  const events: ActivityEvent[] = [];

  // 1. Creation (anonymous reporter — identity supplied, must be dropped).
  const created = createReport({
    configPack: defaultConfigPack,
    zone,
    hazardType: hazard,
    title: 'Unguarded conveyor nip point on night shift',
    reportedLikelihood: 'possible',
    reportedConsequence: 'severe',
    isAnonymous: true,
    reporterId: ANON_SECRET,
    actorRole: 'reporter',
    reportId: 'rpt_demo_anon_lifecycle',
    eventId: 'evt_demo_anon_created',
    now: '2026-06-22T09:00:00.000Z',
  });
  events.push(created.event);

  // 2. Evidence (still the anonymous reporter).
  const evidence = addEvidence(created.report, events, {
    kind: 'photo',
    caption: 'Guard removed; no signage.',
    addedByRole: 'reporter',
    addedById: ANON_SECRET,
    evidenceId: 'evd_demo_anon',
    eventId: 'evt_demo_anon_evidence',
    now: '2026-06-22T09:01:00.000Z',
  });
  events.push(evidence.event);

  // 3. Triage / status change (staff actor — has its own id, not the reporter).
  events.push(
    changeStatus(deriveReportProjection(created.report, events), events, {
      toStatus: 'triaged',
      actorRole: 'triager',
      actorId: 'user_triager_a',
      eventId: 'evt_demo_anon_triaged',
      now: '2026-06-22T09:30:00.000Z',
    }),
  );

  // 4. Assignment.
  events.push(
    assignReport(deriveReportProjection(created.report, events), events, {
      assigneeId: 'user_tech_d',
      actorRole: 'triager',
      actorId: 'user_triager_a',
      eventId: 'evt_demo_anon_assigned',
      now: '2026-06-22T09:31:00.000Z',
    }),
  );

  // 5. Severity review (assess + override).
  events.push(
    setSeverity(deriveReportProjection(created.report, events), events, {
      likelihood: 'possible',
      consequence: 'severe',
      assessedByRole: 'triager',
      assessedById: 'user_triager_a',
      assessmentId: 'sev_demo_anon_1',
      eventId: 'evt_demo_anon_severity',
      now: '2026-06-22T09:32:00.000Z',
    }).event,
  );
  events.push(
    overrideSeverity(deriveReportProjection(created.report, events), events, {
      likelihood: 'likely',
      consequence: 'severe',
      assessedByRole: 'auditor',
      assessedById: 'user_auditor_z',
      reason: 'Escalated after on-site inspection',
      assessmentId: 'sev_demo_anon_2',
      eventId: 'evt_demo_anon_override',
      now: '2026-06-22T10:00:00.000Z',
    }).event,
  );

  // 6. Export (local-only).
  const exportRecord = generateExportRecord(created.report, events, {
    exportId: 'exp_demo_anon',
    now: '2026-06-22T10:05:00.000Z',
  });

  const projection = deriveReportProjection(created.report, events);

  const stages: LifecycleStage[] = events.map((e) => ({
    label: stageLabel(e.type),
    eventType: e.type,
    actorRole: e.actorRole,
    actorId: e.actorId,
    occurredAt: e.occurredAt,
  }));
  stages.push({
    label: 'Export (local-only)',
    eventType: 'export.generated',
    actorRole: '—',
    actorId: null,
    occurredAt: exportRecord.generatedAt,
  });

  // Leak check across every artifact the lifecycle produced.
  const haystack = JSON.stringify({
    report: created.report,
    projection,
    events,
    evidence: evidence.evidence,
    exportRecord,
  });
  const secretLeaked = haystack.includes(ANON_SECRET);

  return {
    secret: ANON_SECRET,
    report: created.report,
    projection,
    events,
    exportRecord,
    stages,
    secretLeaked,
  };
}

function stageLabel(type: string): string {
  switch (type) {
    case 'report.created':
      return 'Creation';
    case 'evidence.added':
      return 'Evidence';
    case 'status.changed':
      return 'Triage / status';
    case 'report.assigned':
      return 'Assignment';
    case 'severity.assessed':
      return 'Severity review';
    case 'severity.overridden':
      return 'Severity override';
    default:
      return type;
  }
}

export const anonymousLifecycle: AnonymousLifecycleDemo =
  buildAnonymousLifecycle();
