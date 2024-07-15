import { type Action, type OverridesFromTrigger, defineCardEffect } from '../card-effect';

export const whileArtifactEquipedEffect = ({
  text,
  actions
}: {
  text: string;
  actions: Action<
    OverridesFromTrigger<
      [
        {
          type: 'on_artifact_equiped';
          params: {
            card: [
              [
                {
                  type: 'self';
                }
              ]
            ];
          };
        }
      ]
    >
  >[];
}) =>
  defineCardEffect({
    text,
    config: {
      executionContext: 'while_equiped',
      triggers: [
        {
          type: 'on_artifact_equiped',
          params: {
            card: [[{ type: 'self' }]]
          }
        }
      ],
      actions
    }
  });
