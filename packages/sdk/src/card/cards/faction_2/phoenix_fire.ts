import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anyOccupiedCell, manualTarget } from '../../helpers/targeting';

export const f2PhoenixFire = defineSerializedBlueprint({
  id: 'LgU-0n',
  collectable: true,
  spriteId: 'icon_f2_phoenix_fire',
  name: 'Phoenix Fire',
  cost: 2,
  faction: FACTION_IDS.F2,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  targets: {
    min: 1,
    targets: [anyOccupiedCell()]
  },
  effects: [
    {
      text: 'Deal 3 damage to a unit.',
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(3),
              targets: manualTarget(0),
              filter: [],
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      }
    }
  ]
});
