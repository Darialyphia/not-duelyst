import type { EntityModifierMixin } from '../entity-modifier';
import { modifierEntityDurationMixin } from './duration.mixin';

export const modifierStatModifierMixin = ({
  duration = Infinity,
  attack,
  maxHp
}: {
  duration?: number;
  attack: number;
  maxHp: number;
}): EntityModifierMixin => {
  let cleanupAttack: () => void;
  let cleanupHp: () => void;

  return modifierEntityDurationMixin({
    duration,
    onApplied(session, attachedTo) {
      cleanupAttack = attachedTo.addInterceptor('attack', val => val + attack);
      cleanupHp = attachedTo.addInterceptor('maxHp', val => val + maxHp);
    },
    onRemoved() {
      cleanupAttack();
      cleanupHp();
    }
  });
};
