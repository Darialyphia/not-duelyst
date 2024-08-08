import type { Filter } from '../card-effect';
import type { GlobalCondition } from '../conditions/global-conditions';

export const zealCondition = (): Filter<GlobalCondition> => {
  return [
    [
      {
        type: 'unit_state',
        params: {
          mode: 'all',
          unit: [[{ type: 'is_self', params: { not: false } }]],
          position: [
            [
              {
                type: 'is_nearby',
                params: {
                  unit: [
                    [
                      { type: 'is_ally', params: { not: false } },
                      { type: 'is_general', params: { not: false } }
                    ]
                  ]
                }
              }
            ]
          ]
        }
      }
    ]
  ];
};
