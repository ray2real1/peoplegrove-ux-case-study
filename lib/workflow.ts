/**
 * Workflow command functions.
 *
 * Every command is a PURE function that:
 *   - validates against the DERIVED current state (not the possibly-stale
 *     projection cache),
 *   - returns one or more {@link ActivityEvent}s (invariant 4),
 *   - never mutates {@link Report} projection fields directly (invariant 3),
 *   - writes an event for every consequential change (invariant 6).
 *
 * Identity safety: for anonymous reports the reporter identity is never
 * stored — reporter-role actor ids are nulled out everywhere (invariants
 * 12 & 13).
 */

import type {
  ActivityEvent,
  CommandClock,
  Consequence,
  Evidence,
  EvidenceKind,
  Id,
  Likelihood,
  Report,
  ReportStatus,
  Role,
  SeverityAssessment,
  ConfigPack,
  Zone,
  HazardType,
} from '@/types';
import { SEVERITY_OVERRIDE_ROLES, SEVERITY_MODEL_VERSION } from '@/types';
import { createEvent, makeId } from '@/lib/audit';
import { makeSyncMeta } from '@/lib/sync';
import { calculateRiskBand, calculateSlaDueAt } from '@/lib/severity';
import { deriveReportProjection } from '@/lib/projections';

/* ------------------------------------------------------------------ */
/* Guards & helpers                                                   */
/* ------------------------------------------------------------------ */

const TERMINAL_STATUSES: ReadonlySet<ReportStatus> = new Set<ReportStatus>([
  'voided',
  'withdrawn',
  'merged',
]);

/** Allowed lifecycle transitions for {@link changeStatus}. */
export const STATUS_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  new: ['triaged'],
  triaged: ['assigned', 'in_progress'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['in_progress'],
  voided: [],
  withdrawn: [],
  merged: [],
};

export function isTerminalStatus(status: ReportStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

function requireReason(reason: string | undefined, action: string): string {
  if (!reason || !reason.trim()) {
    throw new Error(`A reason is required to ${action}.`);
  }
  return reason.trim();
}

function assertNotTerminal(report: Report, action: string): void {
  if (isTerminalStatus(report.currentStatus)) {
    throw new Error(
      `Cannot ${action}: report is in terminal state "${report.currentStatus}".`,
    );
  }
}

function assertCanOverrideSeverity(role: Role): void {
  if (!SEVERITY_OVERRIDE_ROLES.includes(role)) {
    throw new Error(
      `Role "${role}" may not override severity. Allowed: ${SEVERITY_OVERRIDE_ROLES.join(
        ', ',
      )}.`,
    );
  }
}

/**
 * Enforce identity-free anonymous reports: a reporter acting on an
 * anonymous report never has their id stored (invariants 12 & 13).
 */
function sanitizeActorId(
  report: Report,
  role: Role,
  actorId: Id | null,
): Id | null {
  if (report.isAnonymous && role === 'reporter') return null;
  return actorId;
}

/** Derive a trustworthy current state to validate against. */
function current(report: Report, events: ReadonlyArray<ActivityEvent>): Report {
  return deriveReportProjection(report, events);
}

/* ------------------------------------------------------------------ */
/* createReport                                                       */
/* ------------------------------------------------------------------ */

export interface CreateReportInput extends CommandClock {
  configPack: ConfigPack;
  zone: Zone;
  hazardType: HazardType;
  title: string;
  reportedLikelihood: Likelihood;
  reportedConsequence: Consequence;
  isAnonymous: boolean;
  /** Ignored when `isAnonymous` is true. */
  reporterId?: Id | null;
  actorRole?: Role;
  reportId?: Id;
}

export interface CreateReportResult {
  report: Report;
  event: ActivityEvent;
}

export function createReport(input: CreateReportInput): CreateReportResult {
  if (input.zone.configPackId !== input.configPack.id) {
    throw new Error('Zone does not belong to the given ConfigPack.');
  }
  if (input.hazardType.configPackId !== input.configPack.id) {
    throw new Error('HazardType does not belong to the given ConfigPack.');
  }

  const now = input.now ?? new Date().toISOString();
  const reportId = input.reportId ?? makeId('rpt');
  const role: Role = input.actorRole ?? 'reporter';

  // Anonymous reports store NO reporter identity (invariant 12).
  const reporterId = input.isAnonymous ? null : input.reporterId ?? null;
  const actorId = input.isAnonymous && role === 'reporter' ? null : reporterId;

  const identity: Report = {
    id: reportId,
    configPackId: input.configPack.id,
    zoneId: input.zone.id,
    hazardTypeId: input.hazardType.id,
    title: input.title,
    isAnonymous: input.isAnonymous,
    reporterId,
    reportedLikelihood: input.reportedLikelihood,
    reportedConsequence: input.reportedConsequence,
    createdAt: now,
    currentStatus: 'new',
    currentAssigneeId: null,
    currentSeverityAssessmentId: null,
    currentSlaDueAt: null,
    mergedIntoReportId: null,
    syncMeta: makeSyncMeta('local'),
  };

  const event = createEvent({
    id: input.eventId,
    reportId,
    type: 'report.created',
    actorRole: role,
    actorId,
    field: 'currentStatus',
    after: 'new',
    payload: {
      zoneId: input.zone.id,
      hazardTypeId: input.hazardType.id,
      reportedLikelihood: input.reportedLikelihood,
      reportedConsequence: input.reportedConsequence,
      isAnonymous: input.isAnonymous,
    },
    occurredAt: now,
  });

  // Projection is derived, never set by hand.
  const report = deriveReportProjection(identity, [event]);
  return { report, event };
}

/* ------------------------------------------------------------------ */
/* addEvidence                                                        */
/* ------------------------------------------------------------------ */

export interface AddEvidenceInput extends CommandClock {
  kind: EvidenceKind;
  caption: string;
  addedByRole: Role;
  addedById?: Id | null;
  evidenceId?: Id;
}

export interface AddEvidenceResult {
  evidence: Evidence;
  event: ActivityEvent;
}

export function addEvidence(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: AddEvidenceInput,
): AddEvidenceResult {
  const state = current(report, events);
  assertNotTerminal(state, 'add evidence');

  const now = input.now ?? new Date().toISOString();
  const evidenceId = input.evidenceId ?? makeId('evd');
  const addedById = sanitizeActorId(
    report,
    input.addedByRole,
    input.addedById ?? null,
  );

  const evidence: Evidence = {
    id: evidenceId,
    reportId: report.id,
    kind: input.kind,
    caption: input.caption,
    addedByRole: input.addedByRole,
    addedById,
    createdAt: now,
    syncMeta: makeSyncMeta('local'),
  };

  const event = createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'evidence.added',
    actorRole: input.addedByRole,
    actorId: addedById,
    field: 'evidence',
    after: evidenceId,
    payload: { evidenceId, kind: input.kind },
    occurredAt: now,
  });

  return { evidence, event };
}

/* ------------------------------------------------------------------ */
/* setSeverity / overrideSeverity                                     */
/* ------------------------------------------------------------------ */

export interface SetSeverityInput extends CommandClock {
  likelihood: Likelihood;
  consequence: Consequence;
  assessedByRole: Role;
  assessedById?: Id | null;
  assessmentId?: Id;
}

export interface SetSeverityResult {
  assessment: SeverityAssessment;
  event: ActivityEvent;
}

function buildAssessment(
  report: Report,
  input: SetSeverityInput,
  opts: {
    now: string;
    assessmentId: Id;
    isOverride: boolean;
    overrideReason: string | null;
    previousAssessmentId: Id | null;
  },
): SeverityAssessment {
  return {
    id: opts.assessmentId,
    reportId: report.id,
    likelihood: input.likelihood,
    consequence: input.consequence,
    riskBand: calculateRiskBand(input.likelihood, input.consequence),
    assessedByRole: input.assessedByRole,
    assessedById: sanitizeActorId(
      report,
      input.assessedByRole,
      input.assessedById ?? null,
    ),
    isOverride: opts.isOverride,
    overrideReason: opts.overrideReason,
    previousAssessmentId: opts.previousAssessmentId,
    createdAt: opts.now,
    modelVersion: SEVERITY_MODEL_VERSION,
    isIllustrative: true,
    syncMeta: makeSyncMeta('local'),
  };
}

export function setSeverity(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: SetSeverityInput,
): SetSeverityResult {
  // Reporters provide a *provisional* capture value; the confirmed
  // SeverityAssessment record is a triage action (invariant 16 family).
  assertCanOverrideSeverity(input.assessedByRole);

  const state = current(report, events);
  assertNotTerminal(state, 'set severity');

  const now = input.now ?? new Date().toISOString();
  const assessmentId = input.assessmentId ?? makeId('sev');
  const riskBand = calculateRiskBand(input.likelihood, input.consequence);
  const slaDueAt = calculateSlaDueAt(riskBand, now);

  const assessment = buildAssessment(report, input, {
    now,
    assessmentId,
    isOverride: false,
    overrideReason: null,
    previousAssessmentId: null,
  });

  const event = createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'severity.assessed',
    actorRole: input.assessedByRole,
    actorId: assessment.assessedById,
    field: 'currentSeverityAssessmentId',
    after: assessmentId,
    payload: {
      assessmentId,
      riskBand,
      likelihood: input.likelihood,
      consequence: input.consequence,
      slaDueAt,
    },
    occurredAt: now,
  });

  return { assessment, event };
}

export interface OverrideSeverityInput extends SetSeverityInput {
  reason: string;
}

export function overrideSeverity(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: OverrideSeverityInput,
): SetSeverityResult {
  // Restricted to triager / manager / auditor — reporter cannot override
  // (invariant 16).
  assertCanOverrideSeverity(input.assessedByRole);
  const reason = requireReason(input.reason, 'override severity');

  const state = current(report, events);
  assertNotTerminal(state, 'override severity');

  const now = input.now ?? new Date().toISOString();
  const assessmentId = input.assessmentId ?? makeId('sev');
  const previousAssessmentId = state.currentSeverityAssessmentId;
  const riskBand = calculateRiskBand(input.likelihood, input.consequence);
  const slaDueAt = calculateSlaDueAt(riskBand, now);

  const assessment = buildAssessment(report, input, {
    now,
    assessmentId,
    isOverride: true,
    overrideReason: reason,
    previousAssessmentId,
  });

  const event = createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'severity.overridden',
    actorRole: input.assessedByRole,
    actorId: assessment.assessedById,
    field: 'currentSeverityAssessmentId',
    before: previousAssessmentId,
    after: assessmentId,
    reason,
    payload: {
      assessmentId,
      riskBand,
      likelihood: input.likelihood,
      consequence: input.consequence,
      slaDueAt,
      previousAssessmentId: previousAssessmentId ?? 'null',
    },
    occurredAt: now,
  });

  return { assessment, event };
}

/* ------------------------------------------------------------------ */
/* assign / unassign                                                  */
/* ------------------------------------------------------------------ */

export interface AssignInput extends CommandClock {
  assigneeId: Id;
  actorRole: Role;
  actorId?: Id | null;
}

export function assignReport(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: AssignInput,
): ActivityEvent {
  const state = current(report, events);
  assertNotTerminal(state, 'assign');

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'report.assigned',
    actorRole: input.actorRole,
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: 'currentAssigneeId',
    before: state.currentAssigneeId,
    after: input.assigneeId,
    payload: { assigneeId: input.assigneeId },
    occurredAt: now,
  });
}

export interface UnassignInput extends CommandClock {
  actorRole: Role;
  actorId?: Id | null;
  reason?: string;
}

export function unassignReport(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: UnassignInput,
): ActivityEvent {
  const state = current(report, events);
  assertNotTerminal(state, 'unassign');
  if (!state.currentAssigneeId) {
    throw new Error('Cannot unassign: report has no current assignee.');
  }

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'report.unassigned',
    actorRole: input.actorRole,
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: 'currentAssigneeId',
    before: state.currentAssigneeId,
    after: null,
    reason: input.reason ?? null,
    payload: {},
    occurredAt: now,
  });
}

/* ------------------------------------------------------------------ */
/* changeStatus                                                       */
/* ------------------------------------------------------------------ */

export interface ChangeStatusInput extends CommandClock {
  toStatus: ReportStatus;
  actorRole: Role;
  actorId?: Id | null;
  reason?: string;
}

function isReopen(from: ReportStatus, to: ReportStatus): boolean {
  return to === 'in_progress' && (from === 'resolved' || from === 'closed');
}

export function changeStatus(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: ChangeStatusInput,
): ActivityEvent {
  const state = current(report, events);
  const from = state.currentStatus;

  if (TERMINAL_STATUSES.has(input.toStatus)) {
    throw new Error(
      `changeStatus cannot reach terminal state "${input.toStatus}"; ` +
        'use voidReport / withdrawReport / mergeReports.',
    );
  }

  const allowed = STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(input.toStatus)) {
    throw new Error(
      `Invalid status transition: "${from}" → "${input.toStatus}".`,
    );
  }

  let reason: string | null = input.reason ?? null;
  if (isReopen(from, input.toStatus)) {
    reason = requireReason(input.reason, 'reopen a report');
  }

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'status.changed',
    actorRole: input.actorRole,
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: 'currentStatus',
    before: from,
    after: input.toStatus,
    reason,
    payload: { toStatus: input.toStatus, reopened: isReopen(from, input.toStatus) },
    occurredAt: now,
  });
}

/* ------------------------------------------------------------------ */
/* voidReport / withdrawReport / retainReport                         */
/* ------------------------------------------------------------------ */

export interface ReasonedActionInput extends CommandClock {
  actorRole: Role;
  actorId?: Id | null;
  reason: string;
}

export function voidReport(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: ReasonedActionInput,
): ActivityEvent {
  const reason = requireReason(input.reason, 'void a report');
  const state = current(report, events);
  assertNotTerminal(state, 'void');

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'report.voided',
    actorRole: input.actorRole,
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: 'currentStatus',
    before: state.currentStatus,
    after: 'voided',
    reason,
    payload: {},
    occurredAt: now,
  });
}

export function withdrawReport(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: ReasonedActionInput,
): ActivityEvent {
  const reason = requireReason(input.reason, 'withdraw a report');
  const state = current(report, events);
  assertNotTerminal(state, 'withdraw');

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'report.withdrawn',
    actorRole: input.actorRole,
    // Anonymous reporters stay identity-free even on withdrawal.
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: 'currentStatus',
    before: state.currentStatus,
    after: 'withdrawn',
    reason,
    payload: {},
    occurredAt: now,
  });
}

/** Retain-with-reason: explicitly preserve a record (no hard delete). */
export function retainReport(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: ReasonedActionInput,
): ActivityEvent {
  const reason = requireReason(input.reason, 'retain a report');
  const state = current(report, events);

  const now = input.now ?? new Date().toISOString();
  return createEvent({
    id: input.eventId,
    reportId: report.id,
    type: 'report.retained',
    actorRole: input.actorRole,
    actorId: sanitizeActorId(report, input.actorRole, input.actorId ?? null),
    field: null,
    before: state.currentStatus,
    after: state.currentStatus,
    reason,
    payload: { retainedReason: reason },
    occurredAt: now,
  });
}

/* ------------------------------------------------------------------ */
/* mergeReports — non-destructive                                     */
/* ------------------------------------------------------------------ */

export interface MergeReportsInput extends CommandClock {
  actorRole: Role;
  actorId?: Id | null;
  reason: string;
  /** Id for the survivor-side reference event. */
  survivorEventId?: Id;
}

export interface MergeReportsResult {
  /** Appended to the SOURCE's own event log; sets its status to 'merged'. */
  sourceEvent: ActivityEvent;
  /** Appended to the SURVIVOR's log; a reference only — no data absorbed. */
  survivorEvent: ActivityEvent;
}

/**
 * Merge `source` into `survivor` non-destructively (invariant 14):
 *   - the source keeps its own event log and evidence,
 *   - the survivor receives only a reference event,
 *   - nothing is hard-deleted.
 */
export function mergeReports(
  source: Report,
  sourceEvents: ReadonlyArray<ActivityEvent>,
  survivor: Report,
  input: MergeReportsInput,
): MergeReportsResult {
  const reason = requireReason(input.reason, 'merge reports');
  if (source.id === survivor.id) {
    throw new Error('Cannot merge a report into itself.');
  }
  const sourceState = current(source, sourceEvents);
  assertNotTerminal(sourceState, 'merge');

  const now = input.now ?? new Date().toISOString();
  const actorId = sanitizeActorId(source, input.actorRole, input.actorId ?? null);

  const sourceEvent = createEvent({
    id: input.eventId,
    reportId: source.id,
    type: 'report.merged',
    actorRole: input.actorRole,
    actorId,
    field: 'currentStatus',
    before: sourceState.currentStatus,
    after: 'merged',
    reason,
    payload: { targetReportId: survivor.id },
    occurredAt: now,
  });

  const survivorEvent = createEvent({
    id: input.survivorEventId,
    reportId: survivor.id,
    type: 'report.merge_referenced',
    actorRole: input.actorRole,
    // Reference event must not leak the source reporter's identity.
    actorId: sanitizeActorId(survivor, input.actorRole, input.actorId ?? null),
    field: null,
    reason,
    payload: { sourceReportId: source.id },
    occurredAt: now,
  });

  return { sourceEvent, survivorEvent };
}
