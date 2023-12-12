import { keyBy } from 'lodash-es';
import { Effect, EffectId } from './effect';
import { Entity } from '../entity/entity';
import { Constructor } from '@hc/shared';

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

export const EFFECTS = validateEffectMap({});
