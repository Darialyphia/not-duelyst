import type { Values } from '@game/shared';

export const DISPLAY_UNITS_STATS = {
  HOVER_ON_TOP: 'hover-on-top',
  HOVER_ONLY: 'hover-only',
  ALWAYS: 'always'
} as const;
export type DisplayUnitStatsValue = Values<typeof DISPLAY_UNITS_STATS>;

export const DISPLAY_UNITS_NAMES = {
  NEVER: 'never',
  HOVER_ONLY: 'hover-only',
  ALWAYS: 'always'
} as const;
export type DisplayUnitNamesValue = Values<typeof DISPLAY_UNITS_NAMES>;

export const getDefaultSettings = () => ({
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  },
  ui: {
    displayUnitsStats: DISPLAY_UNITS_STATS.HOVER_ONLY as DisplayUnitStatsValue,
    displayUnitsNames: DISPLAY_UNITS_NAMES.NEVER as DisplayUnitNamesValue
  },
  fx: {
    dynamicLighting: true,
    shadows: true
  },
  a11y: {
    colorCodeUnits: false
  }
});

export type Settings = ReturnType<typeof getDefaultSettings>;
