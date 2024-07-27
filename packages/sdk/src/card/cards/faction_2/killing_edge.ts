import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { cellWithAllyMinion, manualTarget } from '../../helpers/targeting';

export const f2KillingEdge = defineSerializedBlueprint({
  id: 'f2_killing_edge',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  name: 'Killing Edge',
  spriteId: 'icon_f2_killing_edge',
  cost: 3,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [cellWithAllyMinion()]
  },
  effects: [
    defineCardEffect({
      text: 'Give an allied minion +4/+2. If it has @Backstab@, draw a card at the end of your turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: fixedAmount(4),
                activeWhen: []
              },
              hp: {
                amount: fixedAmount(2),
                activeWhen: []
              },
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
              filter: [
                [
                  {
                    type: 'unit_state',
                    params: {
                      unit: manualTarget(0),
                      mode: 'all',
                      keyword: 'backstab'
                    }
                  }
                ]
              ],
              execute: 'end_of_turn'
            }
          }
        ]
      }
    })
  ]
});
