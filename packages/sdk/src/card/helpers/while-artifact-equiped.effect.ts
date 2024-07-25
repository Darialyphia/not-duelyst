import {
  type Action,
  type OverridesFromTrigger,
  type TriggerFrequency,
  defineCardEffect
} from '../card-effect';

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
            frequency: TriggerFrequency;
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
            frequency: { type: 'always' },
            card: [[{ type: 'self' }]]
          }
        }
      ],
      actions
    }
  });
