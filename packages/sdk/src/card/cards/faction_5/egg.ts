import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const f5Egg = defineSerializedBlueprint({
  id: 'f5_egg',
  collectable: false,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'token',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_egg',
  name: 'Egg',
  cost: 0,
  attack: 0,
  maxHp: 1,
  faction: 'f5',
  effects: [
    defineCardEffect({
      text: 'Cannot move or attack.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_can_attack',
            params: {
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              target: { candidates: [] }
            }
          },
          {
            type: 'change_stats',
            params: {
              mode: 'set',
              stackable: false,
              targets: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              speed: {
                amount: { type: 'fixed', params: { value: 0 } }
              }
            }
          }
        ]
      }
    })
  ]
});
