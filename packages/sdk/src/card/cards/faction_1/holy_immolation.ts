import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyMinion, manualTarget } from '../../helpers/targeting';

export const f1HolyImmolation = defineSerializedBlueprint({
  id: 'f1_holy_immolation',
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
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: allyMinion() }
          }
        ]
      ]
    ]
  },
  cellHighlights: [
    [
      {
        type: 'is_manual_target',
        params: { index: 0 }
      }
    ],
    [
      {
        type: 'is_nearby',
        params: {
          unit: {
            candidates: [
              [{ type: 'is_manual_target', params: { index: 0, not: false } }]
            ],
            random: false
          }
        }
      }
    ]
  ],
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
              amount: { type: 'fixed', params: { value: 4 } }
            }
          },
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_nearby', params: { unit: manualTarget(0), not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      }
    }
  ]
});
