import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { cellWithAllyMinion, manualTarget } from '../../helpers/targeting';

export const f1HolyImmolation = defineSerializedBlueprint({
  id: 'holy_immolation',
  collectable: true,
  name: 'Holy Immolation',
  cost: 4,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.EPIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_holy_immolation',
  tags: [],
  targets: {
    min: 1,
    targets: [cellWithAllyMinion()]
  },
  effects: [
    {
      text: 'Heal an allied minion for 4 and deal 4 damage to enemies nearby it.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              targets: manualTarget(0),
              amount: fixedAmount(4)
            }
          },
          {
            type: 'deal_damage',
            params: {
              amount: fixedAmount(4),
              targets: [
                [
                  { type: 'is_enemy' },
                  { type: 'is_nearby', params: { unit: manualTarget(0) } }
                ]
              ]
            }
          }
        ]
      }
    }
  ]
});
