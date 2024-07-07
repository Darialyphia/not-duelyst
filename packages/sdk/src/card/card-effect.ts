import { type KeywordId } from '../utils/keywords';

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
  | { type: 'is_nearby'; params: { unit: Array<UnitCondition> } }
  | { type: 'has_keyword'; params: { keyword: KeywordId } }
  | { type: 'is_followup'; params: { index: number } };

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
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_move';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_deal_damage';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_deal_damage';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_take_damage';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_take_damage';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_attack';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_attack';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_healed';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_healed';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_retaliate';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_retaliate';
      params: {
        filter: Array<GlobalCondition>;
        target: Array<UnitCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_unit_play';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_before_unit_destroyed';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | {
      type: 'on_after_unit_destroyed';
      params: {
        filter: Array<GlobalCondition>;
        unit: Array<UnitCondition>;
      };
    }
  | { type: 'on_player_turn_start'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_player_turn_end'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_before_player_draw'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_after_player_draw'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_before_player_replace'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_after_player_replace'; params: { player: Array<PlayerCondition> } }
  | { type: 'on_before_card_played'; params: { card: Array<CardCondition> } }
  | { type: 'on_after_card_played'; params: { card: Array<CardCondition> } }
  | { type: 'on_card_drawn'; params: { card: Array<CardCondition> } }
  | { type: 'on_card_replaced'; params: { card: Array<CardCondition> } };

export type Amount =
  | {
      type: 'fixed';
      params: { value: number };
    }
  | {
      type: 'cards_in_hands';
      params: { player: Array<PlayerCondition> };
    }
  | {
      type: 'attack';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'lowest_attack';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'highest_attack';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'hp';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'lowest_hp';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'highest_hp';
      params: { unit: Array<UnitCondition> };
    }
  | {
      type: 'cost';
      params: { unit: Array<UnitCondition> };
    };

type Action =
  | {
      type: 'deal_damage';
      params: {
        amount: Amount;
        targets: Array<UnitCondition>;
      };
    }
  | {
      type: 'heal';
      params: {
        amount: Amount;
        targets: Array<UnitCondition>;
      };
    }
  | {
      type: 'draw_cards';
      params: {
        amount: Amount;
        player: Array<PlayerCondition>;
      };
    }
  | {
      type: 'change_stats';
      params: {
        attack: Amount;
        hp: Amount;
        targets: Array<UnitCondition>;
      };
    };

export type CardEffectConfig =
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
      triggers: Trigger[];
      actions: Action[];
    };

export type CardEffect = {
  config: CardEffectConfig;
  text: string;
};
