import type { Amount, NumericOperator } from '../card-effect';
import type { UnitConditionExtras } from './unit-conditions';

export type CardConditionBase =
  | { type: 'self' }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount<{ unit: UnitConditionExtras['type'] }>;
      };
    };

export type CardConditionExtras =
  | { type: 'drawn_card' }
  | { type: 'replaced_card' }
  | { type: 'card_replacement' };

export type CardCondition = CardConditionBase | CardConditionExtras;
