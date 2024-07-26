import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anywhere } from '../../helpers/targeting';

export const f2ManaVortex = defineSerializedBlueprint({
  id: 'f2_mana_vortex',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  spriteId: 'icon_f2_mana_vortex',
  name: 'Mana Vortex',
  cost: 0,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [anywhere()]
  },
  effects: [
    {
      text: 'The next spell you play this turn costs 1 less. Draw a card at the end of your turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: [],
              execute: 'now',
              amount: fixedAmount(-1),
              card: [[{ type: 'spell' }]],
              player: [[{ type: 'ally_player' }]],
              occurences_count: 1,
              duration: 'end_of_turn'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: fixedAmount(1),
              player: [[{ type: 'ally_player' }]],
              filter: [],
              execute: 'end_of_turn'
            }
          }
        ]
      }
    }
  ]
});
