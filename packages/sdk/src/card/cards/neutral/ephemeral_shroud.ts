import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralEphemeralShroud = defineSerializedBlueprint({
  id: 'neutral_ephemeral_shroud',
  name: 'Ephemeral Shroud',
  spriteId: 'neutral_ephemeral_shroud',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.DISPEL.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: @Dispel@ a nearby space.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'dispel_cell',
            params: {
              cells: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]]
              },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'is_nearby',
            params: { cell: { candidates: [[{ type: 'summon_target' }]] } }
          }
        ]
      ]
    ]
  }
});
