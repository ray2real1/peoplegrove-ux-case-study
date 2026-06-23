/**
 * Catch / SafeOps Object Model — model-layer test suite.
 *
 * Verifies the claim-safety boundaries and core invariants of the domain
 * model. No UI is exercised here; this is the pure model layer only.
 */

import { describe, it, expect } from 'vitest';

import type {
  ActivityEvent,
  Consequence,
  Likelihood,
  Report,
  RiskBand,
} from '@/types';
import { SEVERITY_MODEL_VERSION } from '@/types';

import {
  calculateRiskBand,
  calculateSlaDueAt,
  SLA_HOURS,
} from '@/lib/severity';
import {
  serializeEventValue,
  createEvent,
  appendEvent,
} from '@/lib/audit';
import {
  deriveReportProjection,
  rebuildAllProjections,
  deriveAggregateSyncState,
} from '@/lib/projections';
import { makeSyncMeta, queueSync } from '@/lib/sync';
import {
  createReport,
  addEvidence,
  setSeverity,
  overrideSeverity,
  assignReport,
  unassignReport,
  changeStatus,
  voidReport,
  withdrawReport,
  mergeReports,
} from '@/lib/workflow';
import { generateExportRecord } from '@/lib/exports';

import { defaultConfigPack } from '@/data/configPacks';
import { zones } from '@/data/zones';
import { hazardTypes } from '@/data/hazardTypes';
import { seedReportAggregates } from '@/data/seedReports';

/* ------------------------------------------------------------------ */
/* Fixtures                                                           */
/* ------------------------------------------------------------------ */

const ZONE = zones[0];
const HAZ = hazardTypes[0];

function makeReport(overrides: Partial<Parameters<typeof createReport>[0]> = {}) {
  return createReport({
    configPack: defaultConfigPack,
    zone: ZONE,
    hazardType: HAZ,
    title: 'Test report',
    reportedLikelihood: 'possible',
    reportedConsequence: 'serious',
    isAnonymous: false,
    reporterId: 'user_reporter_x',
    now: '2026-06-01T00:00:00.000Z',
    ...overrides,
  });
}

/** Walk a report through its full lifecycle, returning report + events. */
function triageAndAssign(
  base: { report: Report; event: ActivityEvent },
): { report: Report; events: ActivityEvent[] } {
  let events: ActivityEvent[] = [base.event];
  events = appendEvent(
    events,
    changeStatus(base.report, events, {
      toStatus: 'triaged',
      actorRole: 'triager',
      actorId: 'user_triager_a',
      now: '2026-06-01T01:00:00.000Z',
    }),
  );
  events = appendEvent(
    events,
    setSeverity(base.report, events, {
      likelihood: 'possible',
      consequence: 'serious',
      assessedByRole: 'triager',
      assessedById: 'user_triager_a',
      now: '2026-06-01T01:05:00.000Z',
    }).event,
  );
  events = appendEvent(
    events,
    assignReport(base.report, events, {
      assigneeId: 'user_tech_d',
      actorRole: 'triager',
      actorId: 'user_triager_a',
      now: '2026-06-01T01:10:00.000Z',
    }),
  );
  return { report: deriveReportProjection(base.report, events), events };
}

/* ------------------------------------------------------------------ */
/* 1. Severity matrix — all 12 cells                                  */
/* ------------------------------------------------------------------ */

describe('severity matrix (locked, illustrative)', () => {
  const cases: Array<[Likelihood, Consequence, RiskBand]> = [
    ['likely', 'minor', 'medium'],
    ['likely', 'serious', 'high'],
    ['likely', 'severe', 'critical'],
    ['likely', 'catastrophic', 'critical'],
    ['possible', 'minor', 'low'],
    ['possible', 'serious', 'medium'],
    ['possible', 'severe', 'high'],
    ['possible', 'catastrophic', 'critical'],
    ['rare', 'minor', 'low'],
    ['rare', 'serious', 'low'],
    ['rare', 'severe', 'medium'],
    ['rare', 'catastrophic', 'high'],
  ];

  it.each(cases)('%s + %s = %s', (likelihood, consequence, band) => {
    expect(calculateRiskBand(likelihood, consequence)).toBe(band);
  });

  it('covers exactly 12 cells (3 likelihoods × 4 consequences)', () => {
    expect(cases).toHaveLength(12);
  });
});

/* ------------------------------------------------------------------ */
/* 2. SLA calculation by risk band                                    */
/* ------------------------------------------------------------------ */

describe('SLA calculation by risk band', () => {
  const from = '2026-06-01T00:00:00.000Z';
  const expected: Array<[RiskBand, number]> = [
    ['critical', 1],
    ['high', 4],
    ['medium', 24],
    ['low', 72],
  ];

  it.each(expected)('%s = %i hours', (band, hours) => {
    expect(SLA_HOURS[band]).toBe(hours);
    const due = calculateSlaDueAt(band, from);
    const diffHours =
      (new Date(due).getTime() - new Date(from).getTime()) / 3_600_000;
    expect(diffHours).toBe(hours);
  });
});

/* ------------------------------------------------------------------ */
/* 3. Invalid workflow transitions                                    */
/* ------------------------------------------------------------------ */

describe('workflow transitions', () => {
  it('rejects an invalid transition (new → resolved)', () => {
    const base = makeReport();
    expect(() =>
      changeStatus(base.report, [base.event], {
        toStatus: 'resolved',
        actorRole: 'triager',
      }),
    ).toThrow(/Invalid status transition/);
  });

  it('allows a valid transition (new → triaged)', () => {
    const base = makeReport();
    const evt = changeStatus(base.report, [base.event], {
      toStatus: 'triaged',
      actorRole: 'triager',
    });
    expect(evt.after).toBe('triaged');
  });

  it('cannot reach terminal states via changeStatus', () => {
    const base = makeReport();
    expect(() =>
      changeStatus(base.report, [base.event], {
        toStatus: 'voided',
        actorRole: 'manager',
      }),
    ).toThrow(/cannot reach terminal state/);
  });

  it('rejects any transition out of a terminal (voided) state', () => {
    const base = makeReport();
    const voided = voidReport(base.report, [base.event], {
      actorRole: 'manager',
      reason: 'duplicate of safety walk finding',
    });
    const events = [base.event, voided];
    const voidedReport = deriveReportProjection(base.report, events);
    expect(() =>
      changeStatus(voidedReport, events, {
        toStatus: 'triaged',
        actorRole: 'manager',
      }),
    ).toThrow(/Invalid status transition/);
  });
});

/* ------------------------------------------------------------------ */
/* 4 & 5. Severity override role rules                                */
/* ------------------------------------------------------------------ */

describe('severity override authorization', () => {
  it('reporter cannot override severity', () => {
    const base = makeReport();
    expect(() =>
      overrideSeverity(base.report, [base.event], {
        likelihood: 'likely',
        consequence: 'severe',
        assessedByRole: 'reporter',
        assessedById: 'user_reporter_x',
        reason: 'I think it is worse',
      }),
    ).toThrow(/may not override severity/);
  });

  it.each(['triager', 'manager', 'auditor'] as const)(
    '%s can override severity with a reason',
    (role) => {
      const base = makeReport();
      const { assessment, event } = overrideSeverity(base.report, [base.event], {
        likelihood: 'likely',
        consequence: 'severe',
        assessedByRole: role,
        assessedById: `user_${role}`,
        reason: 'Re-rated after on-site inspection',
        now: '2026-06-01T02:00:00.000Z',
      });
      expect(assessment.isOverride).toBe(true);
      expect(assessment.riskBand).toBe('critical');
      expect(event.type).toBe('severity.overridden');
      expect(event.reason).toBe('Re-rated after on-site inspection');
    },
  );
});

/* ------------------------------------------------------------------ */
/* 6. Required reason on override / void / merge / reopen / withdraw  */
/* ------------------------------------------------------------------ */

describe('required reason enforcement', () => {
  it('override requires a reason', () => {
    const base = makeReport();
    expect(() =>
      overrideSeverity(base.report, [base.event], {
        likelihood: 'rare',
        consequence: 'minor',
        assessedByRole: 'auditor',
        reason: '   ',
      }),
    ).toThrow(/reason is required/);
  });

  it('void requires a reason', () => {
    const base = makeReport();
    expect(() =>
      voidReport(base.report, [base.event], { actorRole: 'manager', reason: '' }),
    ).toThrow(/reason is required/);
  });

  it('withdraw requires a reason', () => {
    const base = makeReport();
    expect(() =>
      withdrawReport(base.report, [base.event], {
        actorRole: 'reporter',
        reason: '',
      }),
    ).toThrow(/reason is required/);
  });

  it('merge requires a reason', () => {
    const a = makeReport({ reportId: 'rpt_a' });
    const b = makeReport({ reportId: 'rpt_b' });
    expect(() =>
      mergeReports(a.report, [a.event], b.report, {
        actorRole: 'manager',
        reason: '',
      }),
    ).toThrow(/reason is required/);
  });

  it('reopen (closed → in_progress) requires a reason', () => {
    const base = makeReport();
    // Drive to closed.
    let events = [base.event];
    for (const toStatus of ['triaged', 'in_progress', 'resolved', 'closed'] as const) {
      events = appendEvent(
        events,
        changeStatus(deriveReportProjection(base.report, events), events, {
          toStatus,
          actorRole: 'manager',
        }),
      );
    }
    const closed = deriveReportProjection(base.report, events);
    expect(closed.currentStatus).toBe('closed');
    expect(() =>
      changeStatus(closed, events, { toStatus: 'in_progress', actorRole: 'manager' }),
    ).toThrow(/reason is required/);

    const reopened = changeStatus(closed, events, {
      toStatus: 'in_progress',
      actorRole: 'manager',
      reason: 'New information from night shift',
    });
    expect(reopened.reason).toBe('New information from night shift');
    expect(reopened.payload.reopened).toBe('true');
  });
});

/* ------------------------------------------------------------------ */
/* 7-9. Projection: rebuild, no-mutation, stale replay                */
/* ------------------------------------------------------------------ */

describe('projections', () => {
  it('rebuilds current state purely from events', () => {
    const base = makeReport();
    const { events } = triageAndAssign(base);
    const derived = deriveReportProjection(base.report, events);
    expect(derived.currentStatus).toBe('triaged');
    expect(derived.currentAssigneeId).toBe('user_tech_d');
    expect(derived.currentSeverityAssessmentId).not.toBeNull();
    expect(derived.currentSlaDueAt).not.toBeNull();
  });

  it('command functions do not mutate projection fields on the input report', () => {
    const base = makeReport();
    const events = [base.event];
    const before = { ...base.report };

    assignReport(base.report, events, {
      assigneeId: 'user_tech_d',
      actorRole: 'triager',
    });
    changeStatus(base.report, events, { toStatus: 'triaged', actorRole: 'triager' });
    setSeverity(base.report, events, {
      likelihood: 'likely',
      consequence: 'severe',
      assessedByRole: 'triager',
    });

    // The input report's projection fields are untouched by commands.
    expect(base.report.currentStatus).toBe(before.currentStatus);
    expect(base.report.currentAssigneeId).toBe(before.currentAssigneeId);
    expect(base.report.currentSeverityAssessmentId).toBe(
      before.currentSeverityAssessmentId,
    );
    expect(base.report.currentSlaDueAt).toBe(before.currentSlaDueAt);
  });

  it('corrects a stale projection by event replay', () => {
    const base = makeReport();
    const { events } = triageAndAssign(base);

    // Deliberately corrupt the cache.
    const stale: Report = {
      ...base.report,
      currentStatus: 'closed',
      currentAssigneeId: 'WRONG',
      currentSlaDueAt: '1999-01-01T00:00:00.000Z',
    };

    const corrected = deriveReportProjection(stale, events);
    expect(corrected.currentStatus).toBe('triaged');
    expect(corrected.currentAssigneeId).toBe('user_tech_d');
    expect(corrected.currentSlaDueAt).not.toBe('1999-01-01T00:00:00.000Z');
  });

  it('rebuildAllProjections scopes events to each report', () => {
    const reports = seedReportAggregates.map((a) => a.report);
    const allEvents = seedReportAggregates.flatMap((a) => a.events);
    const rebuilt = rebuildAllProjections(reports, allEvents);
    expect(rebuilt).toHaveLength(reports.length);
    for (let i = 0; i < reports.length; i += 1) {
      expect(rebuilt[i].currentStatus).toBe(reports[i].currentStatus);
    }
  });
});

/* ------------------------------------------------------------------ */
/* 10 & 13. Anonymous reports: identity-free everywhere               */
/* ------------------------------------------------------------------ */

describe('anonymous reports stay identity-free', () => {
  it('stores no reporter identity at creation', () => {
    const base = makeReport({ isAnonymous: true, reporterId: 'should_be_dropped' });
    expect(base.report.reporterId).toBeNull();
    expect(base.event.actorId).toBeNull();
    expect(JSON.stringify(base.event)).not.toContain('should_be_dropped');
  });

  it('remains identity-free across the full lifecycle', () => {
    const SECRET = 'reporter_secret_id';
    const base = makeReport({ isAnonymous: true, reporterId: SECRET });
    let events = [base.event];

    // evidence by the anonymous reporter
    const ev = addEvidence(base.report, events, {
      kind: 'photo',
      caption: 'guard rail gap',
      addedByRole: 'reporter',
      addedById: SECRET,
    });
    events = appendEvent(events, ev.event);

    // triage
    events = appendEvent(
      events,
      changeStatus(deriveReportProjection(base.report, events), events, {
        toStatus: 'triaged',
        actorRole: 'triager',
        actorId: 'user_triager_a',
      }),
    );
    // assignment
    events = appendEvent(
      events,
      assignReport(deriveReportProjection(base.report, events), events, {
        assigneeId: 'user_tech_d',
        actorRole: 'triager',
        actorId: 'user_triager_a',
      }),
    );
    // severity review (override by auditor)
    events = appendEvent(
      events,
      setSeverity(deriveReportProjection(base.report, events), events, {
        likelihood: 'possible',
        consequence: 'severe',
        assessedByRole: 'triager',
        assessedById: 'user_triager_a',
      }).event,
    );
    events = appendEvent(
      events,
      overrideSeverity(deriveReportProjection(base.report, events), events, {
        likelihood: 'likely',
        consequence: 'severe',
        assessedByRole: 'auditor',
        assessedById: 'user_auditor_z',
        reason: 'escalated after review',
      }).event,
    );
    // status change to in_progress
    events = appendEvent(
      events,
      changeStatus(deriveReportProjection(base.report, events), events, {
        toStatus: 'in_progress',
        actorRole: 'manager',
        actorId: 'user_manager_c',
      }),
    );

    // merge a second anonymous report into this survivor
    const other = makeReport({
      isAnonymous: true,
      reporterId: SECRET,
      reportId: 'rpt_other_anon',
    });
    const merge = mergeReports(other.report, [other.event], base.report, {
      actorRole: 'manager',
      actorId: 'user_manager_c',
      reason: 'same hazard, two captures',
    });

    // withdrawal of the survivor by the anonymous reporter
    const withdraw = withdrawReport(
      deriveReportProjection(base.report, events),
      events,
      { actorRole: 'reporter', actorId: SECRET, reason: 'resolved on shift' },
    );

    // export
    const exported = generateExportRecord(base.report, events);

    const allArtifacts = [
      base.report,
      ev.evidence,
      merge.sourceEvent,
      merge.survivorEvent,
      withdraw,
      exported,
      ...events,
    ];
    for (const artifact of allArtifacts) {
      expect(JSON.stringify(artifact)).not.toContain(SECRET);
    }
    // The reporter-role evidence/event ids were nulled.
    expect(ev.evidence.addedById).toBeNull();
    expect(ev.event.actorId).toBeNull();
    expect(withdraw.actorId).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* 11. Aggregate sync state — partial                                 */
/* ------------------------------------------------------------------ */

describe('aggregate sync state', () => {
  it('reports partial when one evidence item is queued', () => {
    const items = [
      { syncMeta: makeSyncMeta('synced') },
      { syncMeta: makeSyncMeta('synced') },
      { syncMeta: queueSync(makeSyncMeta('local')) },
    ];
    const summary = deriveAggregateSyncState(items);
    expect(summary.state).toBe('partial');
    expect(summary.queued).toBe(1);
    expect(summary.synced).toBe(2);
  });

  it('reports synced when all are synced', () => {
    const items = [
      { syncMeta: makeSyncMeta('synced') },
      { syncMeta: makeSyncMeta('synced') },
    ];
    expect(deriveAggregateSyncState(items).state).toBe('synced');
  });
});

/* ------------------------------------------------------------------ */
/* 12. Non-destructive merge                                          */
/* ------------------------------------------------------------------ */

describe('non-destructive merge', () => {
  it('source keeps its own log; survivor gets only a reference event', () => {
    const source = makeReport({ reportId: 'rpt_src' });
    const sourceEvents = [source.event];
    const survivor = makeReport({ reportId: 'rpt_surv' });

    const { sourceEvent, survivorEvent } = mergeReports(
      source.report,
      sourceEvents,
      survivor.report,
      { actorRole: 'manager', actorId: 'm1', reason: 'duplicate capture' },
    );

    // Source log retains its original creation event and gains the merge.
    const sourceLog = appendEvent(sourceEvents, sourceEvent);
    expect(sourceLog).toHaveLength(2);
    expect(sourceEvent.type).toBe('report.merged');
    expect(sourceEvent.payload.targetReportId).toBe('rpt_surv');
    expect(deriveReportProjection(source.report, sourceLog).currentStatus).toBe(
      'merged',
    );

    // Survivor only receives a reference; no source data is absorbed.
    expect(survivorEvent.type).toBe('report.merge_referenced');
    expect(survivorEvent.payload.sourceReportId).toBe('rpt_src');
    expect(survivorEvent.reportId).toBe('rpt_surv');
    const survivorLog = appendEvent([survivor.event], survivorEvent);
    expect(deriveReportProjection(survivor.report, survivorLog).currentStatus).toBe(
      'new',
    );
  });
});

/* ------------------------------------------------------------------ */
/* 14. Deterministic before/after serialization                      */
/* ------------------------------------------------------------------ */

describe('event value serialization', () => {
  it('serializes objects deterministically regardless of key order', () => {
    const a = serializeEventValue({ b: 2, a: 1, c: { y: 1, x: 2 } });
    const b = serializeEventValue({ c: { x: 2, y: 1 }, a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it('serializes primitives and null deterministically', () => {
    expect(serializeEventValue(null)).toBe('null');
    expect(serializeEventValue(undefined)).toBe('null');
    expect(serializeEventValue(42)).toBe('42');
    expect(serializeEventValue(true)).toBe('true');
    expect(serializeEventValue('x')).toBe('x');
  });

  it('event before/after are always strings (or null), never objects', () => {
    const evt = createEvent({
      reportId: 'r1',
      type: 'status.changed',
      actorRole: 'manager',
      actorId: 'm1',
      before: { status: 'new' },
      after: { status: 'triaged' },
      occurredAt: '2026-06-01T00:00:00.000Z',
    });
    expect(typeof evt.before).toBe('string');
    expect(typeof evt.after).toBe('string');
    expect(evt.before).toBe('{"status":"new"}');
  });
});

/* ------------------------------------------------------------------ */
/* 15. ExportRecord is local-only                                     */
/* ------------------------------------------------------------------ */

describe('ExportRecord', () => {
  it('is local-only and carries no syncMeta', () => {
    const base = makeReport();
    const { events } = triageAndAssign(base);
    const rec = generateExportRecord(deriveReportProjection(base.report, events), events);
    expect(rec.isLocalOnly).toBe(true);
    expect('syncMeta' in rec).toBe(false);
    expect(rec.snapshot.currentStatus).toBe('triaged');
  });

  it('anonymous export snapshot has null reporterId', () => {
    const base = makeReport({ isAnonymous: true, reporterId: 'nope' });
    const rec = generateExportRecord(base.report, [base.event]);
    expect(rec.snapshot.reporterId).toBe('null');
  });
});

/* ------------------------------------------------------------------ */
/* 16. ActivityEvent immutability                                     */
/* ------------------------------------------------------------------ */

describe('ActivityEvent immutability', () => {
  it('is frozen with no mutation path after creation', () => {
    const base = makeReport();
    expect(Object.isFrozen(base.event)).toBe(true);
    expect(Object.isFrozen(base.event.payload)).toBe(true);
    expect(Object.isFrozen(base.event.syncMeta)).toBe(true);
    expect(() => {
      // @ts-expect-error — readonly at compile time, frozen at runtime.
      base.event.after = 'tampered';
    }).toThrow();
  });
});

/* ------------------------------------------------------------------ */
/* Severity assessment markers (invariant 7)                          */
/* ------------------------------------------------------------------ */

describe('SeverityAssessment markers', () => {
  it('carries the illustrative model version and flag', () => {
    const base = makeReport();
    const { assessment } = setSeverity(base.report, [base.event], {
      likelihood: 'likely',
      consequence: 'minor',
      assessedByRole: 'triager',
    });
    expect(assessment.modelVersion).toBe(SEVERITY_MODEL_VERSION);
    expect(assessment.modelVersion).toBe('catch-demo-severity-v1');
    expect(assessment.isIllustrative).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* unassign sanity                                                    */
/* ------------------------------------------------------------------ */

describe('unassign', () => {
  it('clears the current assignee via event replay', () => {
    const base = makeReport();
    let events = [base.event];
    events = appendEvent(
      events,
      assignReport(base.report, events, {
        assigneeId: 'user_tech_d',
        actorRole: 'triager',
      }),
    );
    events = appendEvent(
      events,
      unassignReport(deriveReportProjection(base.report, events), events, {
        actorRole: 'triager',
        reason: 'reassigning',
      }),
    );
    expect(deriveReportProjection(base.report, events).currentAssigneeId).toBeNull();
  });
});
