import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f2SpiralTechnique = defineSerializedBlueprint({
  id: 'f2_spiral_technique',
  collectable: true,
  spriteId: 'icon_f2_spiral_technique',
  name: 'Spiral Technique',
  cost: 7,
  faction: FACTION_IDS.F2,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
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
      text: 'Deal 8 damage to a unit.',
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 8 } },
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
