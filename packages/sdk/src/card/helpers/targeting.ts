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

export const anywhere = (): Filter<CellConditionBase> => {
  return [[{ type: 'any_cell' }]];
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

export const allyGeneral = (): Filter<UnitConditionBase> => [
  [{ type: 'is_ally' }, { type: 'is_general' }]
];

export const allyMinion = (): Filter<UnitConditionBase> => [
  [{ type: 'is_ally' }, { type: 'is_minion' }]
];

export const enemyGeneral = (): Filter<UnitConditionBase> => [
  [{ type: 'is_enemy' }, { type: 'is_general' }]
];

export const enemyMinion = (): Filter<UnitConditionBase> => [
  [{ type: 'is_enemy' }, { type: 'is_minion' }]
];

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
      params: { unit: enemyMinion() }
    }
  ]
];

export const cellWithAllyMinion = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: allyMinion() }
    }
  ]
];

export const cellWithAllyGeneral = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: allyGeneral() }
    }
  ]
];

export const cellWithEnemyGeneral = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: enemyGeneral() }
    }
  ]
];
