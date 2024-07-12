import type { Filter } from '../card-effect';
import type { UnitCondition } from './unit-conditions';

export type CellConditionBase =
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

export type CellConditionExtras =
  | { type: 'moved_unit_old_position' }
  | { type: 'moved_unit_new_position' }
  | { type: 'moved_path' }
  | { type: 'attack_target_position' }
  | { type: 'attack_source_position' }
  | { type: 'heal_target_position' }
  | { type: 'heal_source_position' };

export type CellCondition = CellConditionBase | CellConditionExtras;
