/**
 * Zone lookup seed data — configurable, tied to a ConfigPack (invariant 10).
 */

import type { Zone } from '@/types';
import { DEFAULT_CONFIG_PACK_ID } from '@/data/configPacks';

export const zones: Zone[] = [
  {
    id: 'zone_turbine_hall',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'TH',
    name: 'Turbine Hall',
    description: 'Primary generation floor; rotating equipment present.',
    isActive: true,
  },
  {
    id: 'zone_switchyard',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'SY',
    name: 'Switchyard',
    description: 'High-voltage outdoor switching area.',
    isActive: true,
  },
  {
    id: 'zone_control_room',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'CR',
    name: 'Control Room',
    description: 'Dim, climate-controlled operations center.',
    isActive: true,
  },
  {
    id: 'zone_loading_dock',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'LD',
    name: 'Loading Dock',
    description: 'Vehicle / forklift movement and material handling.',
    isActive: true,
  },
];

export function findZone(id: string): Zone | undefined {
  return zones.find((z) => z.id === id);
}
