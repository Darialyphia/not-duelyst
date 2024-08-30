import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f2PhoenixFire = defineSerializedBlueprint({
  id: 'f2_phoenix_fire',
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
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: { candidates: [[{ type: 'any_unit' }]], random: false } }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Deal 3 damage to a unit.',
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              targets: manualTarget(0),
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      }
    }
  ]
});
