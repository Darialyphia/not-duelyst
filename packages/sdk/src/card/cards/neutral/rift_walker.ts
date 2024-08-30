import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { airdropEffect } from '../../helpers/airdrop.effect';
import { nearestAllDirections } from '../../helpers/targeting';

export const neutralRiftWalker = defineSerializedBlueprint({
  id: 'neutral_rift_walker',
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
  spriteId: 'neutral_rift_walker',
  tags: [],
  effects: [
    airdropEffect(),
    defineCardEffect({
      text: '@Opening Gambit@: Deal 2 damage to the nearest unit in front, behind, above, and below this.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              amount: { type: 'fixed', params: { value: 2 } },
              targets: nearestAllDirections({
                candidates: [[{ type: 'is_self', params: { not: false } }]]
              })
            }
          }
        ]
      }
    })
  ]
});
