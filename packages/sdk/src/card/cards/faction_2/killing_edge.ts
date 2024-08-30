import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyMinion, manualTarget } from '../../helpers/targeting';

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
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: allyMinion() }
          }
        ]
      ]
    ]
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
                amount: { type: 'fixed', params: { value: 4 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              targets: manualTarget(0),
              filter: { candidates: [] },
              execute: 'now'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]] },
              filter: {
                candidates: [
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
                ]
              },
              execute: 'end_of_turn'
            }
          }
        ]
      }
    })
  ]
});
