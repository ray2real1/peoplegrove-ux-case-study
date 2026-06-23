/**
 * Local-only export.
 *
 * An {@link ExportRecord} is a point-in-time snapshot of a report's DERIVED
 * state. It is local-only and deliberately carries NO {@link SyncMeta}
 * (invariant 9). For anonymous reports the snapshot is identity-free
 * (invariant 13) — `reporterId` is null and never serialized into the snapshot.
 */

import type {
  ActivityEvent,
  ExportFormat,
  ExportRecord,
  Report,
} from '@/types';
import { makeId, serializeEventValue } from '@/lib/audit';
import { deriveReportProjection } from '@/lib/projections';

export interface GenerateExportInput {
  format?: ExportFormat;
  now?: string;
  exportId?: string;
}

/**
 * Produce a local-only export of a report. The snapshot is built from the
 * freshly derived projection so it can never disagree with the event log.
 */
export function generateExportRecord(
  report: Report,
  events: ReadonlyArray<ActivityEvent>,
  input: GenerateExportInput = {},
): ExportRecord {
  const derived = deriveReportProjection(report, events);
  const now = input.now ?? new Date().toISOString();

  // Identity-free snapshot: reporterId is null for anonymous reports and we
  // never include actor ids here.
  const snapshot: Record<string, string> = {
    reportId: derived.id,
    title: derived.title,
    isAnonymous: serializeEventValue(derived.isAnonymous),
    reporterId: serializeEventValue(derived.reporterId),
    zoneId: derived.zoneId,
    hazardTypeId: derived.hazardTypeId,
    currentStatus: derived.currentStatus,
    currentAssigneeId: serializeEventValue(derived.currentAssigneeId),
    currentSeverityAssessmentId: serializeEventValue(
      derived.currentSeverityAssessmentId,
    ),
    currentSlaDueAt: serializeEventValue(derived.currentSlaDueAt),
    mergedIntoReportId: serializeEventValue(derived.mergedIntoReportId),
    eventCount: serializeEventValue(
      events.filter((e) => e.reportId === report.id).length,
    ),
  };

  return {
    id: input.exportId ?? makeId('exp'),
    reportId: report.id,
    format: input.format ?? 'json',
    generatedAt: now,
    snapshot: Object.freeze(snapshot),
    isLocalOnly: true,
  };
}
