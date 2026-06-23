/**
 * Simulated, local-only sync.
 *
 * v1 has NO backend. "Sync" here moves a local record between simulated
 * states within the device only. Every {@link SyncMeta} carries the
 * permanent `isSimulated: true` marker. Nothing in this module performs
 * real network transmission.
 */

import type {
  SyncMeta,
  SyncState,
  AggregateSyncState,
  AggregateSyncSummary,
} from '@/types';

/** Create a fresh local SyncMeta for a newly captured record. */
export function makeSyncMeta(state: SyncState = 'local'): SyncMeta {
  return {
    state,
    localRevision: 1,
    remoteRevision: null,
    lastSyncedAt: null,
    isSimulated: true,
  };
}

/** Return a new SyncMeta with a bumped local revision (immutably). */
export function bumpLocalRevision(meta: SyncMeta): SyncMeta {
  return { ...meta, localRevision: meta.localRevision + 1 };
}

/** Mark a record as queued for (simulated) sync. */
export function queueSync(meta: SyncMeta): SyncMeta {
  return { ...meta, state: 'queued' };
}

/** Move a record into the (simulated) syncing state. */
export function beginSync(meta: SyncMeta): SyncMeta {
  return { ...meta, state: 'syncing' };
}

/**
 * Complete a simulated sync: record moves to `synced`, the simulated
 * remote revision catches up to the local revision.
 */
export function markSynced(meta: SyncMeta, at: string): SyncMeta {
  return {
    ...meta,
    state: 'synced',
    remoteRevision: meta.localRevision,
    lastSyncedAt: at,
  };
}

/** Mark a simulated sync attempt as failed. The local record is not lost. */
export function markSyncFailed(meta: SyncMeta): SyncMeta {
  return { ...meta, state: 'failed' };
}

interface SyncBearing {
  syncMeta: SyncMeta;
}

/**
 * Roll many sync'd records up to a single aggregate state.
 *
 * - All `synced`            → `synced`
 * - Every record same non-synced state → that state (`queued` / `local`)
 * - Anything mixed          → `partial`
 */
export function deriveAggregateSyncState(
  items: ReadonlyArray<SyncBearing>,
): AggregateSyncSummary {
  const summary: AggregateSyncSummary = {
    state: 'synced',
    total: items.length,
    synced: 0,
    queued: 0,
    syncing: 0,
    local: 0,
    failed: 0,
  };

  for (const item of items) {
    summary[item.syncMeta.state] += 1;
  }

  let state: AggregateSyncState;
  if (summary.total === 0) {
    state = 'synced';
  } else if (summary.synced === summary.total) {
    state = 'synced';
  } else if (summary.local === summary.total) {
    state = 'local';
  } else if (summary.queued === summary.total) {
    state = 'queued';
  } else {
    // Any mix of synced / queued / syncing / local / failed.
    state = 'partial';
  }

  summary.state = state;
  return summary;
}
