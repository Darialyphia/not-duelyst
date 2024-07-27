import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f2KageLightning = defineSerializedBlueprint({
  id: 'f2_kage_lightning',
  collectable: false,
  name: 'Kage Lightning',
  cost: 1,
  faction: FACTION_IDS.F2,
  spriteId: 'icon_f2_kage_lightning',
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.TOKEN,
  effects: [
    {
      text: 'Deal 6 damage to a minion.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(6),
              targets: [[{ type: 'is_manual_target', params: { index: 0 } }]],
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 1,
    targets: [[[{ type: 'has_unit', params: { unit: [[{ type: 'is_minion' }]] } }]]]
  }
});
