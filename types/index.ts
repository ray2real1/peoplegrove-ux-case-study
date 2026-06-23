/**
 * Catch / SafeOps Object Model — v1.2
 * ------------------------------------------------------------------
 * Domain model layer for the Catch (goodcatch) safety-reporting
 * prototype. This is a PORTFOLIO PROTOTYPE, not a production EHS /
 * safety system.
 *
 * Claim-safety boundaries encoded by this model:
 *   - Local-only data (no backend; `isSimulated` everywhere).
 *   - Simulated sync (no real server transmission).
 *   - Simulated immutable record (append-only ActivityEvent log).
 *   - Illustrative severity model only (`isIllustrative: true`).
 *   - No emergency dispatch.
 *   - No compliance certification.
 *   - No real PII (anonymous reports carry no reporter identity).
 *
 * Architectural contract:
 *   1. {@link ActivityEvent} is the source of truth.
 *   2. The `current*` fields on {@link Report} are projections / caches
 *      derived from the event log — never authoritative.
 *   3. Command functions never mutate projection fields directly.
 *   4. Command functions return ActivityEvents.
 */

/* ------------------------------------------------------------------ */
/* Identifiers & primitives                                           */
/* ------------------------------------------------------------------ */

export type Id = string;
/** ISO-8601 timestamp string. */
export type IsoTimestamp = string;

export const SEVERITY_MODEL_VERSION = 'catch-demo-severity-v1' as const;
export type SeverityModelVersion = typeof SEVERITY_MODEL_VERSION;

/* ------------------------------------------------------------------ */
/* Roles                                                              */
/* ------------------------------------------------------------------ */

/** Actors who can drive the lifecycle. `reporter` may be anonymous. */
export type Role = 'reporter' | 'triager' | 'manager' | 'auditor' | 'system';

/** Roles permitted to override a severity assessment (invariant 16). */
export const SEVERITY_OVERRIDE_ROLES: readonly Role[] = [
  'triager',
  'manager',
  'auditor',
] as const;

/* ------------------------------------------------------------------ */
/* Severity model (illustrative)                                      */
/* ------------------------------------------------------------------ */

export type Likelihood = 'rare' | 'possible' | 'likely';
export type Consequence = 'minor' | 'serious' | 'severe' | 'catastrophic';
export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

/* ------------------------------------------------------------------ */
/* Sync (simulated / local-only)                                      */
/* ------------------------------------------------------------------ */

/**
 * Programmatic sync state. Maps to the user-facing labels defined in
 * DESIGN.md §9 but is kept separate from copy:
 *   local   → "Saved locally"
 *   queued  → "Saved offline"
 *   syncing → "Syncing"
 *   synced  → "Synced"
 *   failed  → "Still saved locally"
 */
export type SyncState = 'local' | 'queued' | 'syncing' | 'synced' | 'failed';

/**
 * Per-record sync metadata. Present on Report, Evidence, ActivityEvent
 * and SeverityAssessment (invariant 8). NEVER present on ExportRecord
 * (invariant 9). `isSimulated` is a permanent claim-safety marker.
 */
export interface SyncMeta {
  state: SyncState;
  /** Local-clock revision counter; bumped on every local change. */
  localRevision: number;
  /** Simulated remote revision; null until a simulated sync completes. */
  remoteRevision: number | null;
  lastSyncedAt: IsoTimestamp | null;
  /** Hard-coded marker: sync in this prototype is simulated, never real. */
  readonly isSimulated: true;
}

/** Aggregate roll-up across many sync'd records. */
export type AggregateSyncState = 'synced' | 'partial' | 'queued' | 'local';

export interface AggregateSyncSummary {
  state: AggregateSyncState;
  total: number;
  synced: number;
  queued: number;
  syncing: number;
  local: number;
  failed: number;
}

/* ------------------------------------------------------------------ */
/* Configuration: ConfigPack, Zone, HazardType                        */
/* ------------------------------------------------------------------ */

/**
 * A versioned bundle of configurable lookups. Zones and HazardTypes are
 * tied to a ConfigPack (invariant 10).
 */
export interface ConfigPack {
  id: Id;
  name: string;
  version: string;
  severityModelVersion: SeverityModelVersion;
  readonly isIllustrative: true;
  createdAt: IsoTimestamp;
}

export interface Zone {
  id: Id;
  configPackId: Id;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface HazardType {
  id: Id;
  configPackId: Id;
  code: string;
  name: string;
  description: string;
  /** Provisional likelihood suggested for fast field capture. */
  defaultLikelihood: Likelihood;
  isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* ActivityEvent — the source of truth                                */
/* ------------------------------------------------------------------ */

export type ActivityEventType =
  | 'report.created'
  | 'evidence.added'
  | 'severity.assessed'
  | 'severity.overridden'
  | 'report.assigned'
  | 'report.unassigned'
  | 'status.changed'
  | 'report.voided'
  | 'report.withdrawn'
  | 'report.merged'
  | 'report.merge_referenced'
  | 'report.retained';

/**
 * Append-only, immutable (frozen) record of one consequential change.
 *
 * - `before` / `after` are deterministic strings (invariant 15), never
 *   raw objects. Use {@link ../lib/audit#serializeEventValue}.
 * - `actorId` is null for anonymous-reporter actions (invariant 12).
 * - `payload` carries deterministic string fields only.
 */
export interface ActivityEvent {
  readonly id: Id;
  readonly reportId: Id;
  readonly type: ActivityEventType;
  readonly actorRole: Role;
  /** Null for anonymous reporters; never stores reporter identity. */
  readonly actorId: Id | null;
  /** Which projection field this event changed, when applicable. */
  readonly field: string | null;
  readonly before: string | null;
  readonly after: string | null;
  /** Required for void / merge / withdraw / reopen / override / retain. */
  readonly reason: string | null;
  /** Deterministic string-valued payload. */
  readonly payload: Readonly<Record<string, string>>;
  readonly occurredAt: IsoTimestamp;
  readonly syncMeta: SyncMeta;
}

/* ------------------------------------------------------------------ */
/* SeverityAssessment                                                 */
/* ------------------------------------------------------------------ */

/**
 * One severity determination. The first is `assessed`; later ones may be
 * overrides (`isOverride: true`, requiring a reason + privileged role).
 * Always carries the illustrative-model markers (invariant 7).
 */
export interface SeverityAssessment {
  id: Id;
  reportId: Id;
  likelihood: Likelihood;
  consequence: Consequence;
  riskBand: RiskBand;
  assessedByRole: Role;
  assessedById: Id | null;
  isOverride: boolean;
  overrideReason: string | null;
  previousAssessmentId: Id | null;
  createdAt: IsoTimestamp;
  readonly modelVersion: SeverityModelVersion;
  readonly isIllustrative: true;
  syncMeta: SyncMeta;
}

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

export type EvidenceKind = 'photo' | 'note' | 'measurement' | 'document';

export interface Evidence {
  id: Id;
  reportId: Id;
  kind: EvidenceKind;
  /** Caption / description. Must not contain real PII in this prototype. */
  caption: string;
  addedByRole: Role;
  addedById: Id | null;
  createdAt: IsoTimestamp;
  syncMeta: SyncMeta;
}

/* ------------------------------------------------------------------ */
/* Workflow status                                                    */
/* ------------------------------------------------------------------ */

export type ReportStatus =
  | 'new'
  | 'triaged'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  // terminal states reached only via dedicated command functions:
  | 'voided'
  | 'withdrawn'
  | 'merged';

/* ------------------------------------------------------------------ */
/* Report                                                             */
/* ------------------------------------------------------------------ */

/**
 * A near-miss / hazard report.
 *
 * IMMUTABLE IDENTITY fields are set at creation and never change.
 * The `current*` fields are PROJECTIONS rebuilt from the event log by
 * {@link ../lib/projections#deriveReportProjection}. No command function
 * may write them directly (invariant 3).
 */
export interface Report {
  /* --- immutable identity --- */
  readonly id: Id;
  readonly configPackId: Id;
  readonly zoneId: Id;
  readonly hazardTypeId: Id;
  readonly title: string;
  readonly isAnonymous: boolean;
  /** Null whenever `isAnonymous` is true (invariant 12). */
  readonly reporterId: Id | null;
  readonly reportedLikelihood: Likelihood;
  readonly reportedConsequence: Consequence;
  readonly createdAt: IsoTimestamp;

  /* --- projections / caches (derived from events) --- */
  currentStatus: ReportStatus;
  currentAssigneeId: Id | null;
  currentSeverityAssessmentId: Id | null;
  currentSlaDueAt: IsoTimestamp | null;
  mergedIntoReportId: Id | null;

  syncMeta: SyncMeta;
}

/* ------------------------------------------------------------------ */
/* ExportRecord — local-only, no SyncMeta                             */
/* ------------------------------------------------------------------ */

export type ExportFormat = 'json' | 'summary';

/**
 * A point-in-time, local-only snapshot of a report's derived state.
 * Deliberately carries NO {@link SyncMeta} (invariant 9) and is never
 * synced. Snapshot is identity-free for anonymous reports.
 */
export interface ExportRecord {
  id: Id;
  reportId: Id;
  format: ExportFormat;
  generatedAt: IsoTimestamp;
  /** Deterministic string snapshot of the derived projection. */
  snapshot: Readonly<Record<string, string>>;
  readonly isLocalOnly: true;
}

/* ------------------------------------------------------------------ */
/* Command option / result shapes                                     */
/* ------------------------------------------------------------------ */

/** Common timing / id-injection options for deterministic, pure commands. */
export interface CommandClock {
  now?: IsoTimestamp;
  eventId?: Id;
}

/** A report paired with its event log — the unit projections operate on. */
export interface ReportAggregate {
  report: Report;
  events: ActivityEvent[];
  evidence: Evidence[];
  severityAssessments: SeverityAssessment[];
}
