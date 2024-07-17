import type { Filter } from '../card-effect';
import type { CellConditionBase } from '../conditions/cell-conditions';
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

export const manualTarget = (index: number): Filter<UnitConditionBase> => {
  return [
    [
      {
        type: 'is_manual_target',
        params: { index }
      }
    ]
  ];
};

export const anyOccupiedCell = (): Filter<CellConditionBase> => [
  [{ type: 'has_unit', params: { unit: [[{ type: 'any_unit' }]] } }]
];

export const cellWithAnyMinion = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: [[{ type: 'is_minion' }]] }
    }
  ]
];

export const cellWithEnemyMinion = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: [[{ type: 'is_enemy' }, { type: 'is_minion' }]] }
    }
  ]
];

export const cellWithAllyMinion = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: [[{ type: 'is_ally' }, { type: 'is_minion' }]] }
    }
  ]
];

export const cellWithAllyGeneral = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: [[{ type: 'is_ally' }, { type: 'is_general' }]] }
    }
  ]
];
