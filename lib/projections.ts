/**
 * Projections.
 *
 * The `current*` fields on a {@link Report} are CACHES. The authoritative
 * state lives in the {@link ActivityEvent} log. {@link deriveReportProjection}
 * rebuilds those fields purely from the events, so a stale or corrupted
 * projection is always correctable by replay (invariant 5).
 */

import type {
  ActivityEvent,
  Report,
  ReportStatus,
  Id,
  IsoTimestamp,
} from '@/types';

export { deriveAggregateSyncState } from '@/lib/sync';

interface DerivedState {
  currentStatus: ReportStatus;
  currentAssigneeId: Id | null;
  currentSeverityAssessmentId: Id | null;
  currentSlaDueAt: IsoTimestamp | null;
  mergedIntoReportId: Id | null;
}

/**
 * Fold an event log into the derived projection state for one report.
 * Events are processed in chronological order.
 */
function foldEvents(events: ReadonlyArray<ActivityEvent>): DerivedState {
  const state: DerivedState = {
    currentStatus: 'new',
    currentAssigneeId: null,
    currentSeverityAssessmentId: null,
    currentSlaDueAt: null,
    mergedIntoReportId: null,
  };

  const ordered = [...events].sort((a, b) =>
    a.occurredAt < b.occurredAt ? -1 : a.occurredAt > b.occurredAt ? 1 : 0,
  );

  for (const event of ordered) {
    switch (event.type) {
      case 'report.created':
        state.currentStatus = 'new';
        break;
      case 'status.changed':
        if (event.after) state.currentStatus = event.after as ReportStatus;
        break;
      case 'report.assigned':
        state.currentAssigneeId = event.payload.assigneeId ?? null;
        break;
      case 'report.unassigned':
        state.currentAssigneeId = null;
        break;
      case 'severity.assessed':
      case 'severity.overridden':
        state.currentSeverityAssessmentId = event.payload.assessmentId ?? null;
        state.currentSlaDueAt = event.payload.slaDueAt ?? null;
        break;
      case 'report.voided':
        state.currentStatus = 'voided';
        break;
      case 'report.withdrawn':
        state.currentStatus = 'withdrawn';
        break;
      case 'report.merged':
        state.currentStatus = 'merged';
        state.mergedIntoReportId = event.payload.targetReportId ?? null;
        break;
      // 'report.merge_referenced', 'evidence.added', 'report.retained'
      // do not change projection fields.
      default:
        break;
    }
  }

  return state;
}

/**
 * Rebuild a report's projection fields from its event log. Immutable
 * identity fields are preserved; only the `current*` caches are recomputed.
 * Returns a NEW Report; the input is not mutated.
 */
export function deriveReportProjection(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
): Report {
  const scoped = events.filter((e) => e.reportId === report.id);
  const derived = foldEvents(scoped);
  return {
    ...report,
    currentStatus: derived.currentStatus,
    currentAssigneeId: derived.currentAssigneeId,
    currentSeverityAssessmentId: derived.currentSeverityAssessmentId,
    currentSlaDueAt: derived.currentSlaDueAt,
    mergedIntoReportId: derived.mergedIntoReportId,
  };
}

/**
 * Rebuild projections for many reports from a shared event log.
 * Each report receives only the events scoped to its own id.
 */
export function rebuildAllProjections(
  reports: ReadonlyArray<Report>,
  events: ReadonlyArray<ActivityEvent>,
): Report[] {
  return reports.map((report) => deriveReportProjection(report, events));
}
