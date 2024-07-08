import { type KeywordId } from '../utils/keywords';

export type Filter<T> = T[][];

export type GlobalCondition =
  | {
      type: 'player_gold';
      params: {
        operator: 'equals' | 'more_than' | 'less_than';
        amount: number;
      };
    }
  | {
      type: 'player_hp';
      params: {
        operator: 'equals' | 'more_than' | 'less_than';
        amount: number;
      };
    };

export type UnitCondition =
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
  | { type: 'has_keyword'; params: { keyword: KeywordId } }
  | { type: 'is_followup'; params: { index: number } };

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
  | {
      type: 'ally_player';
    }
  | { type: 'enemy_player' }
  | { type: 'any_player' };

export type CardCondition =
  | {
      type: 'self';
    }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | {
      type: 'cost';
      params: {
        operator: 'equals' | 'more_than' | 'less_than';
        amount: Amount;
      };
    };

type Trigger =
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

export type Amount =
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
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'lowest_attack';
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'highest_attack';
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'hp';
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'lowest_hp';
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'highest_hp';
      params: { unit: Filter<UnitCondition> };
    }
  | {
      type: 'cost';
      params: { unit: Filter<UnitCondition> };
    };

export type Action =
  | {
      type: 'deal_damage';
      params: {
        amount: Amount;
        targets: Filter<UnitCondition>;
      };
    }
  | {
      type: 'heal';
      params: {
        amount: Amount;
        targets: Filter<UnitCondition>;
      };
    }
  | {
      type: 'draw_cards';
      params: {
        amount: Amount;
        player: Filter<PlayerCondition>;
      };
    }
  | {
      type: 'change_stats';
      params: {
        attack: Amount;
        hp: Amount;
        targets: Filter<UnitCondition>;
      };
    };

export type InitAction =
  | {
      type: 'airdrop';
    }
  | {
      type: 'rush';
    };

export type CardEffectConfig =
  | {
      executionContext: 'immediate';
      actions: Action[];
    }
  | { executionContext: 'on_init'; actions: InitAction[] }
  | {
      executionContext:
        | 'while_in_hand'
        | 'while_on_board'
        | 'while_in_deck'
        | 'while_in_graveyard';
      triggers: Trigger[];
      actions: Action[];
    };

export type CardEffect = {
  config: CardEffectConfig;
  text: string;
};
