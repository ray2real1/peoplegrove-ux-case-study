/**
 * Audit log primitives.
 *
 * The {@link ActivityEvent} log is the source of truth (invariant 1) and a
 * SIMULATED immutable record: every event is frozen on creation so there is
 * no mutation path afterwards (invariant: "no mutation path for ActivityEvent
 * after creation"). `before` / `after` are always deterministic strings
 * (invariant 15) produced by {@link serializeEventValue}.
 */

import type {
  ActivityEvent,
  ActivityEventType,
  Id,
  IsoTimestamp,
  Role,
} from '@/types';
import { makeSyncMeta } from '@/lib/sync';

/**
 * Convert any value to a deterministic string suitable for an event's
 * `before` / `after` / `payload` fields.
 *
 * - Objects/arrays are serialized with recursively sorted keys so the same
 *   logical value always yields the same string (invariant 15).
 * - `null` / `undefined` → the literal string `"null"`.
 */
export function serializeEventValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    default:
      return JSON.stringify(sortDeep(value));
  }
}

/** Recursively sort object keys so JSON output is stable / deterministic. */
function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

let __eventCounter = 0;
/** Local, deterministic-enough id generator (no PII, no network). */
export function makeId(prefix: string): Id {
  __eventCounter += 1;
  return `${prefix}_${__eventCounter.toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export interface CreateEventInput {
  id?: Id;
  reportId: Id;
  type: ActivityEventType;
  actorRole: Role;
  actorId: Id | null;
  field?: string | null;
  /** Raw value; serialized deterministically. `undefined` → null. */
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  payload?: Record<string, unknown>;
  occurredAt: IsoTimestamp;
}

/**
 * Build a frozen {@link ActivityEvent}. The returned object (and its nested
 * payload / syncMeta) is deeply frozen — there is no mutation path after
 * creation. This is the ONLY way events are constructed.
 */
export function createEvent(input: CreateEventInput): ActivityEvent {
  const payload: Record<string, string> = {};
  if (input.payload) {
    for (const [k, v] of Object.entries(input.payload)) {
      payload[k] = serializeEventValue(v);
    }
  }

  const event: ActivityEvent = {
    id: input.id ?? makeId('evt'),
    reportId: input.reportId,
    type: input.type,
    actorRole: input.actorRole,
    actorId: input.actorId,
    field: input.field ?? null,
    before: input.before === undefined ? null : serializeEventValue(input.before),
    after: input.after === undefined ? null : serializeEventValue(input.after),
    reason: input.reason ?? null,
    payload: Object.freeze(payload),
    occurredAt: input.occurredAt,
    syncMeta: Object.freeze(makeSyncMeta('local')),
  };

  return Object.freeze(event);
}

/**
 * Append an event to a log, returning a NEW array (the input is never
 * mutated). The event is already frozen by {@link createEvent}.
 */
export function appendEvent(
  events: ReadonlyArray<ActivityEvent>,
  event: ActivityEvent,
): ActivityEvent[] {
  return [...events, event];
}
