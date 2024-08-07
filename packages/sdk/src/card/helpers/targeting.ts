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
    [{ type: 'is_nearest_above', params: { unit: originConditions, not: false } }],
    [{ type: 'is_nearest_below', params: { unit: originConditions, not: false } }],
    [
      {
        type: 'is_nearest_in_front',
        params: { unit: originConditions, not: false }
      }
    ],
    [{ type: 'is_nearest_behind', params: { unit: originConditions, not: false } }]
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
        params: { index, not: false }
      }
    ]
  ];
};

export const allyGeneral = (): Filter<UnitConditionBase> => [
  [
    { type: 'is_ally', params: { not: false } },
    { type: 'is_general', params: { not: false } }
  ]
];

export const allyMinion = (): Filter<UnitConditionBase> => [
  [
    { type: 'is_ally', params: { not: false } },
    { type: 'is_minion', params: { not: false } }
  ]
];

export const enemyGeneral = (): Filter<UnitConditionBase> => [
  [
    { type: 'is_enemy', params: { not: false } },
    { type: 'is_general', params: { not: false } }
  ]
];

export const enemyMinion = (): Filter<UnitConditionBase> => [
  [
    { type: 'is_enemy', params: { not: false } },
    { type: 'is_minion', params: { not: false } }
  ]
];

export const anyOccupiedCell = (): Filter<CellConditionBase> => [
  [{ type: 'has_unit', params: { unit: [[{ type: 'any_unit' }]] } }]
];

export const cellWithAnyMinion = (): Filter<CellConditionBase> => [
  [
    {
      type: 'has_unit',
      params: { unit: [[{ type: 'is_minion', params: { not: false } }]] }
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
