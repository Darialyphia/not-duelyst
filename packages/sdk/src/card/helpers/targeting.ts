import type { Filter } from '../card-effect';
import type { CellConditionBase } from '../conditions/cell-conditions';
import type {
  UnitConditionBase,
  UnitConditionExtras
} from '../conditions/unit-conditions';

export const nearestAllDirections = <T extends UnitConditionExtras['type']>(
  originConditions: Filter<UnitConditionBase | Extract<UnitConditionExtras, { type: T }>>
): Filter<UnitConditionBase> => {
  return {
    candidates: [
      [{ type: 'is_nearest_above', params: { unit: originConditions, not: false } }],
      [{ type: 'is_nearest_below', params: { unit: originConditions, not: false } }],
      [
        {
          type: 'is_nearest_in_front',
          params: { unit: originConditions, not: false }
        }
      ],
      [{ type: 'is_nearest_behind', params: { unit: originConditions, not: false } }]
    ],
    random: false
  };
};

export const anywhere = (random = false): Filter<CellConditionBase> => {
  return { candidates: [[{ type: 'any_cell' }]], random };
};

export const manualTarget = (index: number): Filter<UnitConditionBase> => {
  return {
    candidates: [
      [
        {
          type: 'is_manual_target',
          params: { index, not: false }
        }
      ]
    ],
    random: false
  };
};

export const allyGeneral = (): Filter<UnitConditionBase> => ({
  candidates: [
    [
      { type: 'is_ally', params: { not: false } },
      { type: 'is_general', params: { not: false } }
    ]
  ],
  random: false
});

export const allyMinion = (random = false): Filter<UnitConditionBase> => ({
  candidates: [
    [
      { type: 'is_ally', params: { not: false } },
      { type: 'is_minion', params: { not: false } }
    ]
  ],
  random
});

export const enemyGeneral = (): Filter<UnitConditionBase> => ({
  candidates: [
    [
      { type: 'is_enemy', params: { not: false } },
      { type: 'is_general', params: { not: false } }
    ]
  ],
  random: false
});

export const enemyMinion = (random = false): Filter<UnitConditionBase> => ({
  candidates: [
    [
      { type: 'is_enemy', params: { not: false } },
      { type: 'is_minion', params: { not: false } }
    ]
  ],
  random
});

export const anyOccupiedCell = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: { unit: { candidates: [[{ type: 'any_unit' }]], random: false } }
      }
    ]
  ],
  random: false
});

export const cellWithAnyMinion = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: {
          unit: {
            candidates: [[{ type: 'is_minion', params: { not: false } }]],
            random: false
          }
        }
      }
    ]
  ],
  random: false
});

export const cellWithEnemyMinion = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: { unit: enemyMinion() }
      }
    ]
  ],
  random: false
});

export const cellWithAllyMinion = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: { unit: allyMinion() }
      }
    ]
  ],
  random: false
});

export const cellWithAllyGeneral = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: { unit: allyGeneral() }
      }
    ]
  ],
  random: false
});

export const cellWithEnemyGeneral = (): Filter<CellConditionBase> => ({
  candidates: [
    [
      {
        type: 'has_unit',
        params: { unit: enemyGeneral() }
      }
    ]
  ],
  random: false
});
