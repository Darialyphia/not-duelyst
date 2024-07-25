import type { AnyObject, PartialRecord } from '@game/shared';
import type {
  CardCondition,
  CardConditionBase,
  CardConditionExtras
} from './conditions/card-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import type { PlayerCondition } from './conditions/player-condition';
import type {
  UnitCondition,
  UnitConditionBase,
  UnitConditionExtras
} from './conditions/unit-conditions';

export type Filter<T> = T[][];

export type NumericOperator = 'equals' | 'more_than' | 'less_than';

export type ConditionOverrides = {
  unit?: UnitCondition['type'];
  card?: CardCondition['type'];
};

export type TriggerFrequency =
  | {
      type: 'always';
    }
  | { type: 'once' }
  | { type: 'n_per_turn'; params: { count: number } };

export type Trigger =
  | {
      type: 'on_before_unit_move';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_move';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_deal_damage';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_deal_damage';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_take_damage';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_take_damage';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_attack';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_attack';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_healed';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_healed';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_retaliate';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_retaliate';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_unit_play';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_destroyed';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_destroyed';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_player_turn_start';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_player_turn_end';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_before_player_draw';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_after_player_draw';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_before_player_replace';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_after_player_replace';
      params: { frequency: TriggerFrequency; player: Filter<PlayerCondition> };
    }
  | {
      type: 'on_before_card_played';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    }
  | {
      type: 'on_after_card_played';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    }
  | {
      type: 'on_card_drawn';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    }
  | {
      type: 'on_card_replaced';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    }
  | {
      type: 'on_artifact_equiped';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    };

export type Amount<T extends ConditionOverrides> =
  | {
      type: 'fixed';
      params: { value: number };
    }
  | {
      type: 'cards_in_hands';
      params: { player: Filter<PlayerCondition> };
    }
  | {
      type: 'attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'maxHp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'cost';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    };

export type Action<
  T extends ConditionOverrides = {
    unit: UnitConditionExtras['type'];
    card: CardConditionExtras['type'];
  }
> =
  | {
      type: 'deal_damage';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'heal';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'draw_cards';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        player: Filter<PlayerCondition>;
      };
    }
  | {
      type: 'change_stats';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        attack?: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        hp?: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        stackable: boolean;
      };
    }
  | {
      type: 'change_damage_taken';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
      };
    }
  | {
      type: 'change_damage_dealt';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
      };
    }
  | {
      type: 'change_heal_received';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
      };
    }
  | {
      type: 'provoke';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'celerity';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'destroy_unit';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'add_effect';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        effect: CardEffectConfig<Trigger[]>;
      };
    }
  | {
      type: 'zeal';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        effect: CardEffectConfig<Trigger[]>;
      };
    };

export type ActionParams<T extends Action['type']> = (Action & {
  type: T;
})['params'];

export type InitAction =
  | {
      type: 'airdrop';
    }
  | {
      type: 'rush';
    };

type TriggerOverridesMap = {
  unit: {
    on_before_unit_move: 'moved_unit';
    on_after_unit_move: 'moved_unit';
    on_before_unit_deal_damage: 'attack_source' | 'attack_target';
    on_after_unit_deal_damage: 'attack_source' | 'attack_target';
    on_before_unit_take_damage: 'attack_source' | 'attack_target';
    on_after_unit_take_damage: 'attack_source' | 'attack_target';
    on_before_unit_attack: 'attack_source' | 'attack_target';
    on_after_unit_attack: 'attack_source' | 'attack_target';
    on_before_unit_retaliate: 'attack_source' | 'attack_target';
    on_after_unit_retaliate: 'attack_source' | 'attack_target';
    on_before_unit_healed: 'healing_source' | 'healing_target';
    on_after_unit_healed: 'healing_source' | 'healing_target';
    on_unit_play: 'played_unit';
    on_before_unit_destroyed: 'destroyed_unit';
    on_after_unit_destroyed: 'destroyed_unit';
  };
  card: {
    on_card_drawn: 'drawn_card';
    on_after_player_draw: 'drawn_card';
    on_card_replaced: 'replaced_card';
    on_before_player_replace: 'replaced_card';
    on_after_player_replace: 'replaced_card' | 'card_replacement';
  };
};

type Intersection<K, U> = K & U;

export type OverridesFromTrigger<T extends Trigger[]> = {
  unit: TriggerOverridesMap['unit'][Intersection<
    T[number]['type'],
    keyof TriggerOverridesMap['unit']
  >];
  card: TriggerOverridesMap['card'][Intersection<
    T[number]['type'],
    keyof TriggerOverridesMap['card']
  >];
};

export type CardEffectConfig<T extends Trigger[]> =
  | { executionContext: 'on_init'; actions: InitAction[] }
  | {
      executionContext: 'immediate';
      actions: Action[];
    }
  | {
      executionContext:
        | 'while_in_hand'
        | 'while_on_board'
        | 'while_in_deck'
        | 'while_equiped'
        | 'while_in_graveyard';
      triggers: T;
      actions: Action<OverridesFromTrigger<T>>[];
    };

export type CardEffect<T extends Trigger[]> = {
  config: CardEffectConfig<T>;
  text: string;
};
export type GenericCardEffect = CardEffect<any>;
// used in custom card GUI code
export type WidenedGenericCardEffect = {
  text: string;
  config: {
    executionContext: ExecutionContext;
    triggers?: Array<{
      type: string;
      params: any;
    }>;
    actions: any;
  };
};

export type ExecutionContext = GenericCardEffect['config']['executionContext'];

export const defineCardEffect = <T extends Trigger[]>(effect: CardEffect<T>) => effect;
