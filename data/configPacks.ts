/**
 * ConfigPack seed data.
 *
 * Zones and HazardTypes are configurable lookups tied to a ConfigPack
 * (invariant 10). This default pack is an illustrative demo configuration.
 */

import type { ConfigPack } from '@/types';
import { SEVERITY_MODEL_VERSION } from '@/types';

export const DEFAULT_CONFIG_PACK_ID = 'cfg_catch_demo_v1_2';

export const defaultConfigPack: ConfigPack = {
  id: DEFAULT_CONFIG_PACK_ID,
  name: 'Catch Demo Pack',
  version: '1.2',
  severityModelVersion: SEVERITY_MODEL_VERSION,
  isIllustrative: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const configPacks: ConfigPack[] = [defaultConfigPack];
