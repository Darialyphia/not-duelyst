import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralLightbender = defineSerializedBlueprint({
  id: 'neutral_lightbender',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.DISPEL.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_ligthbender',
  name: 'Lightbender',
  cost: 4,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: @Dispel@ nearby spaces.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'dispel_cell',
            params: {
              cells: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        }
                      }
                    }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
