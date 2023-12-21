import { DotEffect } from './dot.effect';
import { Effect } from './effect';
import { Constructor } from '@hc/shared';
import { StatModifierEffect } from './stat-modifier.effect';
import { MeditatingEffect } from './meditating.effect';

type GenericEffectMap = Record<string, Constructor<Effect>>;

type ValidatedEffectMap<T extends GenericEffectMap> = {
  [Name in keyof T]: T[Name] extends Constructor<Effect>
    ? Name extends InstanceType<T[Name]>['id']
      ? T[Name]
      : never
    : never;
};

const validateEffectMap = <T extends GenericEffectMap>(data: ValidatedEffectMap<T>) =>
  data;

export const EFFECTS = validateEffectMap({
  dot: DotEffect,
  statModifier: StatModifierEffect,
  meditating: MeditatingEffect
});
