import type { Filter } from '../card-effect';
import type {
  UnitConditionBase,
  UnitConditionExtras
} from '../conditions/unit-conditions';

export const nearestAllDirections = <T extends UnitConditionExtras['type']>(
  originConditions: Filter<UnitConditionBase | Extract<UnitConditionExtras, { type: T }>>
): Filter<UnitConditionBase> => {
  return [
    [{ type: 'is_nearest_above', params: { unit: originConditions } }],
    [{ type: 'is_nearest_below', params: { unit: originConditions } }],
    [
      {
        type: 'is_nearest_in_front',
        params: { unit: originConditions }
      }
    ],
    [{ type: 'is_nearest_behind', params: { unit: originConditions } }]
  ];
};

export const followup = (index: number): Filter<UnitConditionBase> => {
  return [
    [
      {
        type: 'is_followup',
        params: { index }
      }
    ]
  ];
};
