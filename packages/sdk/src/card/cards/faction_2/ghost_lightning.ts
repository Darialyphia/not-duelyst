import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anywhere, enemyMinion } from '../../helpers/targeting';

export const f2GhostLightning = defineSerializedBlueprint({
  id: 'f2_ghost_lightning',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  spriteId: 'icon_f2_ghost_lightning',
  name: 'Ghost Lightning',
  cost: 1,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [anywhere()]
  },
  effects: [
    {
      text: 'Deal 1 damage to enemy minions',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(1),
              targets: enemyMinion(),
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
