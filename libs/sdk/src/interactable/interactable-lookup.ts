import { Constructor } from '@hc/shared';
import { Interactable } from './interactable';
import { GoldCoin } from './gold-coin';

type GenericInteractableMap = Record<string, Constructor<Interactable>>;

type ValidatedInteractableMap<T extends GenericInteractableMap> = {
  [Name in keyof T]: T[Name] extends Constructor<Interactable>
    ? Name extends InstanceType<T[Name]>['id']
      ? T[Name]
      : never
    : never;
};

const validateInteractableMap = <T extends GenericInteractableMap>(
  data: ValidatedInteractableMap<T>
) => data;

export const INTERACTABLES = validateInteractableMap({
  GOLD_COIN: GoldCoin
});
