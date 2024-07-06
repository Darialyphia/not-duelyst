import { type KeywordId } from '../utils/keywords';

type GlobalCondition =
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

type UnitCondition =
  | { type: 'is_self' }
  | { type: 'is_general' }
  | { type: 'is_minion' }
  | { type: 'is_ally' }
  | { type: 'is_enemy' }
  | { type: 'is_nearby' }
  | { type: 'has_keyword'; params: { keyword: KeywordId } }
  | { type: 'is_followup'; params: { index: number } };

type PlayerCondition =
  | {
      type: 'ally_player';
    }
  | { type: 'enemy_player' }
  | { type: 'any_player' };

type CardCondition =
  | {
      type: 'self';
    }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | {
      type: 'cost';
      params: {
        operator: 'equals' | 'more_than' | 'less_than';
        amount: number;
      };
    };

type Trigger =
  | {
      type: 'while_on_board';
      params: {
        filter: Array<GlobalCondition>;
      };
    }
  | {
      type: 'while_in_hand';
      params: {
        filter: Array<GlobalCondition>;
      };
    }
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
      type: 'on_unit_death';
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
  | { type: 'on_card_drawn'; params: { card: Array<CardCondition> } };

type Action =
  | {
      type: 'deal_damage';
      params: {
        amount: number;
        targets: Array<UnitCondition>;
      };
    }
  | {
      type: 'heal';
      params: {
        amount: number;
        targets: Array<UnitCondition>;
      };
    };

export type CardEffectConfig = {
  trigger: Trigger;
  actions: Action[];
};

export type CardEffect = {
  config: CardEffectConfig;
  text: string;
};
