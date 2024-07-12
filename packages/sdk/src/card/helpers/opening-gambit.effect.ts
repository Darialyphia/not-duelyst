import { defineCardEffect, type Action, type OverridesFromTrigger } from '../card-effect';

export const openingGambitEffect = ({
  text,
  actions
}: {
  text: string;
  actions: Action<
    OverridesFromTrigger<
      {
        type: 'on_unit_play';
        params: {
          unit: [
            [
              {
                type: 'is_self';
              }
            ]
          ];
        };
      }[]
    >
  >[];
}) =>
  defineCardEffect({
    text: `@Opening Gambit@: ${text}`,
    config: {
      executionContext: 'while_on_board',
      triggers: [
        {
          type: 'on_unit_play',
          params: {
            unit: [[{ type: 'is_self' }]]
          }
        }
      ],
      actions
    }
  });
