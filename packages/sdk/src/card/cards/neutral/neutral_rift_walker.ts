import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const neutralRiftWalker = defineSerializedBlueprint({
  id: 'rift_walker',
  collectable: true,
  name: 'Rift Walker',
  cost: 3,
  attack: 2,
  maxHp: 1,
  faction: null,
  keywords: [KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.AIRDROP.id],
  kind: 'MINION',
  rarity: 'epic',
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'neutral_rift_walker',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Airdrop@',
      config: {
        executionContext: 'on_init',
        actions: [{ type: 'airdrop' }]
      }
    }),
    defineCardEffect({
      text: '@Opening Gambit@: Deal 2 damage to the nearest unit in front, behind, above, and below this.',
      config: {
        executionContext: 'while_on_board',
        triggers: [{ type: 'on_unit_play', params: { unit: [[{ type: 'is_self' }]] } }],
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: [
                [{ type: 'is_nearest_above', params: { unit: [[{ type: 'is_self' }]] } }],
                [{ type: 'is_nearest_below', params: { unit: [[{ type: 'is_self' }]] } }],
                [
                  {
                    type: 'is_nearest_in_front',
                    params: { unit: [[{ type: 'is_self' }]] }
                  }
                ],
                [{ type: 'is_nearest_behind', params: { unit: [[{ type: 'is_self' }]] } }]
              ]
            }
          }
        ]
      }
    })
  ]
});
