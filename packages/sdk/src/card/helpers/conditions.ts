import type { Filter } from '../card-effect';
import type { GlobalCondition } from '../conditions/global-conditions';

export const zealCondition = (): Filter<GlobalCondition> => {
  return [
    [
      {
        type: 'unit_state',
        params: {
          mode: 'all',
          unit: [[{ type: 'is_self' }]],
          state: {
            position: [
              [
                {
                  type: 'is_nearby',
                  params: {
                    unit: [[{ type: 'is_ally' }, { type: 'is_general' }]]
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  ];
};
