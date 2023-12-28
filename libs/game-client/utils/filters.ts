import type { EFFECTS } from '@hc/sdk';
import type { PartialRecord } from '@hc/shared';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import type { Filter } from 'pixi.js';

export const EFFECT_FILTERS = {
  exhausted: [new AdjustmentFilter({ saturation: 0.3 })]
} as const satisfies PartialRecord<keyof typeof EFFECTS, Filter[]>;
