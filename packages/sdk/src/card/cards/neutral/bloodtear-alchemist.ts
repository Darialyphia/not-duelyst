import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralBloodtearAlchemist = defineSerializedBlueprint({
  id: 'neutral_bloodtear_alchemist',
  name: 'Bloodtear Alchemist',
  spriteId: 'neutral_bloodtear_alchemist',
  collectable: true,
  keywords: ['opening_gambit'],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: {
    min: 0,
    targets: [
      [[{ type: 'has_unit', params: { unit: { candidates: [[{ type: 'any_unit' }]] } } }]]
    ]
  },
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 1,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: Deal 1 damage to another unit.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
