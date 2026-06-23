/**
 * HazardType lookup seed data — configurable, tied to a ConfigPack
 * (invariant 10). `defaultLikelihood` is a provisional capture hint only.
 */

import type { HazardType } from '@/types';
import { DEFAULT_CONFIG_PACK_ID } from '@/data/configPacks';

export const hazardTypes: HazardType[] = [
  {
    id: 'haz_slip_trip',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'STF',
    name: 'Slip / Trip / Fall',
    description: 'Spills, cables, uneven surfaces, housekeeping.',
    defaultLikelihood: 'possible',
    isActive: true,
  },
  {
    id: 'haz_electrical',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'ELE',
    name: 'Electrical',
    description: 'Exposed conductors, arc-flash potential, lockout gaps.',
    defaultLikelihood: 'rare',
    isActive: true,
  },
  {
    id: 'haz_pinch_point',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'PIN',
    name: 'Pinch Point / Caught-Between',
    description: 'Rotating equipment, moving loads, mechanical guarding.',
    defaultLikelihood: 'possible',
    isActive: true,
  },
  {
    id: 'haz_chemical',
    configPackId: DEFAULT_CONFIG_PACK_ID,
    code: 'CHM',
    name: 'Chemical / Spill',
    description: 'Leaks, fumes, incompatible storage, PPE gaps.',
    defaultLikelihood: 'rare',
    isActive: true,
  },
];

export function findHazardType(id: string): HazardType | undefined {
  return hazardTypes.find((h) => h.id === id);
}
