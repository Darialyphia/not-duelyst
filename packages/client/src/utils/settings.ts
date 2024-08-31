import type { Values } from '@game/shared';

export const DISPLAY_UNITS_STATS = {
  NEVER: 'never',
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

export const COLOR_CODED_UNITS = {
  OFF: 'off',
  SUBTLE: 'subtle',
  STRONG: 'strong'
} as const;
export type ColorCodedUnitsValue = Values<typeof COLOR_CODED_UNITS>;

export const getDefaultSettings = () => ({
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  },
  ui: {
    displayUnitsStats: DISPLAY_UNITS_STATS.ALWAYS as DisplayUnitStatsValue,
    displayUnitsNames: DISPLAY_UNITS_NAMES.NEVER as DisplayUnitNamesValue,
    cardsWith3D: true,
    displayDangerTiles: true,
    displayDangerArrows: true
  },
  fx: {
    dynamicLighting: false,
    shadows: true,
    tintStrength: [0]
  },
  a11y: {
    colorCodeUnits: COLOR_CODED_UNITS.OFF as ColorCodedUnitsValue,
    reducedMotions: false
  }
});

export type Settings = ReturnType<typeof getDefaultSettings>;
