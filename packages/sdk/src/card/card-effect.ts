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

export type Trigger =
  | {
      type: 'on_before_unit_move';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_move';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_deal_damage';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_deal_damage';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_take_damage';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_take_damage';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_attack';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_attack';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_healed';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_healed';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_retaliate';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_retaliate';
      params: {
        target: Filter<UnitConditionBase>;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_unit_play';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_before_unit_destroyed';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_destroyed';
      params: {
        unit: Filter<UnitConditionBase>;
      };
    }
  | { type: 'on_player_turn_start'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_player_turn_end'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_player_draw'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_after_player_draw'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_player_replace'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_after_player_replace'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_card_played'; params: { card: Filter<CardConditionBase> } }
  | { type: 'on_after_card_played'; params: { card: Filter<CardConditionBase> } }
  | { type: 'on_card_drawn'; params: { card: Filter<CardConditionBase> } }
  | { type: 'on_card_replaced'; params: { card: Filter<CardConditionBase> } }
  | { type: 'on_artifact_equiped'; params: { card: Filter<CardConditionBase> } };

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
        attack: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        hp: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        stackable: boolean;
      };
    }
  | {
      type: 'provoke';
      params: {
        activeWhen?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'add_effect';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        effect: CardEffectConfig<Trigger[]>;
      };
    };

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

export const defineCardEffect = <T extends Trigger[]>(effect: CardEffect<T>) => effect;
