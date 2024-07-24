import type { Amount, ConditionOverrides, Filter, NumericOperator } from '../card-effect';
import type { CardConditionExtras } from './card-conditions';
import type { CellCondition } from './cell-conditions';
import type { PlayerCondition } from './player-condition';
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
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'player_hp';
      params: {
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'unit_state';
      params: {
        unit: Filter<UnitConditionBase>;
        mode: 'none' | 'some' | 'all';
        attack?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        hp?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        position?: Filter<CellCondition>;
      };
    };
