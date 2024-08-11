import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2JadeMonk = defineSerializedBlueprint({
  id: 'f2_jade_monk',
  name: 'Jade Monk',
  spriteId: 'f2_jade_monk',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 4,
  maxHp: 3,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: 'This card costs 1 less for each spell you played this turn.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              amount: {
                type: 'card_played_since_last_turn',
                params: { card: { candidates: [[{ type: 'spell' }]] }, scale: -1 }
              },
              card: { candidates: [[{ type: 'self' }]] },
              player: { candidates: [[{ type: 'ally_player' }]] },
              occurences_count: 0,
              duration: 'always'
            }
          }
        ]
      }
    })
  ]
});
