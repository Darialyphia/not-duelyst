import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { allyGeneral, enemyGeneral } from '../../helpers/targeting';

export const f2FourWindsMagus = defineSerializedBlueprint({
  id: 'f2_four_windw_magus',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  name: 'Four Winds Magus',
  spriteId: 'f2_four_winds_magus',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: 'When you play a spell, deal 1 damage to the enemy general and heal your general for 1.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_card_played',
            params: {
              card: [
                [
                  { type: 'spell' },
                  {
                    type: 'from_player',
                    params: {
                      player: [[{ type: 'ally_player' }]]
                    }
                  }
                ]
              ],
              frequency: { type: 'always' }
            }
          }
        ],
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(1),
              targets: enemyGeneral(),
              filter: [],
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: fixedAmount(1),
              targets: allyGeneral(),
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
