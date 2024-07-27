import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anyOccupiedCell, manualTarget } from '../../helpers/targeting';

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
    targets: [anyOccupiedCell()]
  },
  effects: [
    {
      text: 'Deal 8 damage to a unit.',
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(8),
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
