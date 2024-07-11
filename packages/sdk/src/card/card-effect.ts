import { type KeywordId } from '../utils/keywords';

export type Filter<T> = T[][];

export type NumericOperator = 'equals' | 'more_than' | 'less_than';

export type GlobalCondition =
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
    };

export type UnitConditionBase =
  | { type: 'is_self' }
  | { type: 'is_general' }
  | { type: 'is_minion' }
  | { type: 'is_ally' }
  | { type: 'is_enemy' }
  | { type: 'is_nearby'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_in_front'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_nearest_in_front'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_behind'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_nearest_behind'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_above'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_nearest_above'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_below'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_nearest_below'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_followup'; params: { index: number } }
  | { type: 'has_keyword'; params: { keyword: KeywordId } };

export type UnitConditionExtras =
  | { type: 'attack_target' }
  | { type: 'attack_source' }
  | { type: 'healing_target' }
  | { type: 'healing_source' }
  | { type: 'moved_unit' }
  | { type: 'played_unit' }
  | { type: 'destroyed_unit' };

export type UnitCondition = UnitConditionBase | UnitConditionExtras;

export type CellCondition =
  | { type: 'is_empty' }
  | { type: 'has_unit'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_at'; params: { x: number; y: number; z: number } }
  | { type: 'is_nearby'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_in_front'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_behind'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_above'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_below'; params: { unit: Filter<UnitCondition> } }
  | { type: 'is_followup'; params: { index: number } }
  | { type: 'is_top_right_corner' }
  | { type: 'is_top_left_corner' }
  | { type: 'is_bottom_right_corner' }
  | { type: 'is_bottom_left_corner' };

export type PlayerCondition =
  | { type: 'ally_player' }
  | { type: 'enemy_player' }
  | { type: 'any_player' };

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

type CardCondition = CardConditionBase | CardConditionExtras;

type ConditionOverrides = {
  unit?: UnitCondition['type'];
  card?: CardCondition['type'];
};

export type Trigger =
  | {
      type: 'on_before_unit_move';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_move';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_deal_damage';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_deal_damage';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_take_damage';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_take_damage';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_attack';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_attack';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_healed';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_healed';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_retaliate';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_retaliate';
      params: {
        target: Filter<UnitCondition>;
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_unit_play';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_destroyed';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_destroyed';
      params: {
        unit: Filter<UnitCondition>;
      };
    }
  | { type: 'on_player_turn_start'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_player_turn_end'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_player_draw'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_after_player_draw'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_player_replace'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_after_player_replace'; params: { player: Filter<PlayerCondition> } }
  | { type: 'on_before_card_played'; params: { card: Filter<CardCondition> } }
  | { type: 'on_after_card_played'; params: { card: Filter<CardCondition> } }
  | { type: 'on_card_drawn'; params: { card: Filter<CardCondition> } }
  | { type: 'on_card_replaced'; params: { card: Filter<CardCondition> } };

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
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_attack';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_attack';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'hp';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_hp';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_hp';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'cost';
      params: {
        unit: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    };

export type Action<T extends ConditionOverrides = Record<string, never>> =
  | {
      type: 'deal_damage';
      params: {
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'heal';
      params: {
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'draw_cards';
      params: {
        amount: Amount<T>;
        player: Filter<PlayerCondition>;
      };
    }
  | {
      type: 'change_stats';
      params: {
        attack: Amount<T>;
        hp: Amount<T>;
        targets: Filter<
          UnitConditionBase & Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    };

export type InitAction =
  | {
      type: 'airdrop';
    }
  | {
      type: 'rush';
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
        | 'while_in_graveyard';
      triggers: T;
      actions: Action[];
    };

export type CardEffect<T extends Trigger[]> = {
  config: CardEffectConfig<T>;
  text: string;
};

export const defineCardEffect = <T extends Trigger[]>(effect: CardEffect<T>) => effect;
