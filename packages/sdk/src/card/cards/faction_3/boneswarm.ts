import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3BoneSwarm = defineSerializedBlueprint({
  id: 'f3_boneswarm',
  name: 'Bone Swarm',
  spriteId: 'icon_f3_boneswarm',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'Deal 2 damage to the enemy general and enemy minions nearby them.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } }
                  ],
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [
                            [
                              { type: 'is_general', params: { not: false } },
                              { type: 'is_enemy', params: { not: false } }
                            ]
                          ]
                        },
                        cell: { candidates: [] },
                        not: false
                      }
                    }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  }
});
