import type { KeywordId } from '../../utils/keywords';
import type { Filter } from '../card-effect';

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
