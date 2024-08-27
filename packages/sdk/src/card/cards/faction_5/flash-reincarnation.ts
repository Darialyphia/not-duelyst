import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const f5FlashReincranation = defineSerializedBlueprint({
  id: 'f5_flash_reincarnation',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  effects: [
    defineCardEffect({
      text: 'Give a minion @Rebirth@.',
      config: {
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ]
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [{ type: 'rebirth', params: {} }]
              }
            }
          }
        ],
        executionContext: 'immediate'
      },
      vfx: { tracks: [] }
    })
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: { candidates: [[{ type: 'is_minion', params: { not: false } }]] }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f5_flashreincarnation',
  name: 'Flash Reincranation',
  cost: 0,
  faction: 'f5'
});
