import type { Amount, ConditionOverrides, Filter, NumericOperator } from '../card-effect';
import type { CardConditionExtras } from './card-conditions';
import type { CellCondition } from './cell-conditions';
import type { UnitConditionBase, UnitConditionExtras } from './unit-conditions';

export type GlobalCondition<
  T extends ConditionOverrides = {
    unit: UnitConditionExtras['type'];
    card: CardConditionExtras['type'];
  }
> =
  | {
      type: 'player_gold';
      params: {
        operator: NumericOperator;
        amount: number;
      };
    }
  | {
      type: 'player_hp';
      params: {
        operator: NumericOperator;
        amount: number;
      };
    }
  | {
      type: 'unit_state';
      params: {
        unit: Filter<UnitConditionBase>;
        state: {
          attack?: {
            operator: NumericOperator;
            amount: Amount<T>;
          };
          hp?: {
            operator: NumericOperator;
            amount: Amount<T>;
          };
          position?: CellCondition;
        };
      };
    };
