/**
 * Seed report aggregates.
 *
 * Each aggregate is built by replaying the SAME command functions the rest
 * of the app uses, then deriving its projection from the resulting event
 * log — so the seed data exercises (and honors) every model invariant,
 * including identity-free anonymous reports.
 *
 * All timestamps / ids are injected for determinism.
 */

import type { ActivityEvent, ReportAggregate } from '@/types';
import { defaultConfigPack } from '@/data/configPacks';
import { zones } from '@/data/zones';
import { hazardTypes } from '@/data/hazardTypes';
import {
  createReport,
  setSeverity,
  changeStatus,
  assignReport,
  addEvidence,
} from '@/lib/workflow';
import { deriveReportProjection } from '@/lib/projections';

const zoneById = (id: string) => zones.find((z) => z.id === id)!;
const hazById = (id: string) => hazardTypes.find((h) => h.id === id)!;

/* ---- Scenario 1: anonymous slip/trip, triaged + severity assessed ---- */

function buildAnonymousSlipReport(): ReportAggregate {
  const events: ActivityEvent[] = [];

  const created = createReport({
    configPack: defaultConfigPack,
    zone: zoneById('zone_turbine_hall'),
    hazardType: hazById('haz_slip_trip'),
    title: 'Oil sheen near turbine walkway',
    reportedLikelihood: 'possible',
    reportedConsequence: 'serious',
    isAnonymous: true,
    reportId: 'rpt_seed_anon_1',
    eventId: 'evt_seed_anon_1_created',
    now: '2026-06-20T08:00:00.000Z',
  });
  events.push(created.event);

  const evidence = addEvidence(created.report, events, {
    kind: 'note',
    caption: 'Sheen roughly 1m across; no signage present.',
    addedByRole: 'reporter',
    evidenceId: 'evd_seed_anon_1',
    eventId: 'evt_seed_anon_1_evidence',
    now: '2026-06-20T08:01:00.000Z',
  });
  events.push(evidence.event);

  const triaged = changeStatus(created.report, events, {
    toStatus: 'triaged',
    actorRole: 'triager',
    actorId: 'user_triager_a',
    eventId: 'evt_seed_anon_1_triaged',
    now: '2026-06-20T08:30:00.000Z',
  });
  events.push(triaged);

  const severity = setSeverity(created.report, events, {
    likelihood: 'possible',
    consequence: 'serious',
    assessedByRole: 'triager',
    assessedById: 'user_triager_a',
    assessmentId: 'sev_seed_anon_1',
    eventId: 'evt_seed_anon_1_severity',
    now: '2026-06-20T08:31:00.000Z',
  });
  events.push(severity.event);

  const report = deriveReportProjection(created.report, events);
  return {
    report,
    events,
    evidence: [evidence.evidence],
    severityAssessments: [severity.assessment],
  };
}

/* ---- Scenario 2: attributed electrical report, assigned + in progress ---- */

function buildElectricalReport(): ReportAggregate {
  const events: ActivityEvent[] = [];

  const created = createReport({
    configPack: defaultConfigPack,
    zone: zoneById('zone_switchyard'),
    hazardType: hazById('haz_electrical'),
    title: 'Missing lockout tag on breaker B12',
    reportedLikelihood: 'rare',
    reportedConsequence: 'catastrophic',
    isAnonymous: false,
    reporterId: 'user_reporter_b',
    reportId: 'rpt_seed_elec_1',
    eventId: 'evt_seed_elec_1_created',
    now: '2026-06-21T14:00:00.000Z',
  });
  events.push(created.event);

  const triaged = changeStatus(created.report, events, {
    toStatus: 'triaged',
    actorRole: 'manager',
    actorId: 'user_manager_c',
    eventId: 'evt_seed_elec_1_triaged',
    now: '2026-06-21T14:05:00.000Z',
  });
  events.push(triaged);

  const severity = setSeverity(created.report, events, {
    likelihood: 'rare',
    consequence: 'catastrophic',
    assessedByRole: 'manager',
    assessedById: 'user_manager_c',
    assessmentId: 'sev_seed_elec_1',
    eventId: 'evt_seed_elec_1_severity',
    now: '2026-06-21T14:06:00.000Z',
  });
  events.push(severity.event);

  const assigned = assignReport(created.report, events, {
    assigneeId: 'user_tech_d',
    actorRole: 'manager',
    actorId: 'user_manager_c',
    eventId: 'evt_seed_elec_1_assigned',
    now: '2026-06-21T14:10:00.000Z',
  });
  events.push(assigned);

  const inProgress = changeStatus(created.report, events, {
    toStatus: 'in_progress',
    actorRole: 'manager',
    actorId: 'user_manager_c',
    eventId: 'evt_seed_elec_1_inprogress',
    now: '2026-06-21T14:11:00.000Z',
  });
  events.push(inProgress);

  const report = deriveReportProjection(created.report, events);
  return {
    report,
    events,
    evidence: [],
    severityAssessments: [severity.assessment],
  };
}

export const seedReportAggregates: ReportAggregate[] = [
  buildAnonymousSlipReport(),
  buildElectricalReport(),
];

/** Flat event log across all seed reports (the source of truth). */
export const seedEvents: ActivityEvent[] = seedReportAggregates.flatMap(
  (a) => a.events,
);
