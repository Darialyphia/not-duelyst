import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3StaffOfYkir = defineSerializedBlueprint({
  id: 'f3_staff_of_ykir',
  name: "Staff of Y'kir",
  spriteId: 'icon_f3_artifact_staff_of_ykir',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'Your general has +2/+0',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_artifact_equiped',
            params: {
              card: { candidates: [[{ type: 'self', params: {} }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    },
    {
      text: 'When this is destroyed, shuffle a copy of it into your deck.',
      config: {
        executionContext: 'while_equiped',
        actions: [
          {
            type: 'generate_card',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              ephemeral: false,
              blueprint: ['f3_staff_of_ykir'],
              location: 'deck',
              player: { candidates: [[{ type: 'ally_player' }]] }
            }
          }
        ],
        triggers: [
          {
            type: 'on_artifact_destroyed',
            params: {
              card: { candidates: [[{ type: 'self', params: {} }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  }
});
