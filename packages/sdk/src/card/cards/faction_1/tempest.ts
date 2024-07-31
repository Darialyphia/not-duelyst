import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anywhere } from '../../helpers/targeting';

export const f1Tempest = defineSerializedBlueprint({
  id: 'tempest',
  collectable: true,
  name: 'Tempest',
  cost: 2,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_tempest',
  tags: [],
  targets: {
    min: 1,
    targets: [anywhere()]
  },
  cellHighlights: [
    [
      {
        type: 'has_unit',
        params: { unit: [[{ type: 'any_unit' }]] }
      }
    ]
  ],
  effects: [
    {
      text: 'Deal 2 damage to all units.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              targets: [[{ type: 'any_unit' }]],
              amount: fixedAmount(2)
            }
          }
        ]
      }
    }
  ]
});
