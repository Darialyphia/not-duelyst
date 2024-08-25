import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3TimeMaelstrom = defineSerializedBlueprint({
  id: 'f3_time_maelstrom',
  collectable: true,
  keywords: [KEYWORDS.EPHEMERAL.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'rare',
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f3_time_maelstrom',
  name: 'Time maelstrom',
  cost: 5,
  faction: 'f3',
  effects: [
    {
      text: 'Give @Ephemeral@ to all minions.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [{ type: 'ephemeral', params: {} }]
              },
              linkToCard: false,
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
