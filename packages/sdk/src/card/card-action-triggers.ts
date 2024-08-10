import type { Filter } from './card-effect';
import type { CardConditionBase } from './conditions/card-conditions';
import type { PlayerCondition } from './conditions/player-condition';
import type { UnitConditionBase } from './conditions/unit-conditions';

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
      type: 'on_before_unit_teleport';
      params: {
        frequency: TriggerFrequency;
        unit: Filter<UnitConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_teleport';
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
        unit?: Filter<UnitConditionBase>;
        card?: Filter<CardConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_take_damage';
      params: {
        frequency: TriggerFrequency;
        target: Filter<UnitConditionBase>;
        unit?: Filter<UnitConditionBase>;
        card?: Filter<CardConditionBase>;
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
        unit?: Filter<UnitConditionBase>;
        card?: Filter<CardConditionBase>;
      };
    }
  | {
      type: 'on_after_unit_healed';
      params: {
        frequency: TriggerFrequency;
        unit?: Filter<UnitConditionBase>;
        card?: Filter<CardConditionBase>;
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
    }
  | {
      type: 'on_artifact_destroyed';
      params: { frequency: TriggerFrequency; card: Filter<CardConditionBase> };
    };
