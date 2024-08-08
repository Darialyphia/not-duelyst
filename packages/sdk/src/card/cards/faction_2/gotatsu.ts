import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { manualTarget } from '../../helpers/targeting';

export const f2Gotatsu = defineSerializedBlueprint({
  id: 'KSF_eA',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  spriteId: 'icon_f2_gotatsu',
  name: 'Gotatsu',
  cost: 1,
  faction: FACTION_IDS.F2,
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: [[{ type: 'is_minion', params: { not: false } }]]
            }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Deal 1 damage to a minion. Draw a card at the end of the turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(1),
              targets: manualTarget(0),
              filter: [],
              execute: 'now'
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
