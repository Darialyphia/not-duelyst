import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f1Martyrdom = defineSerializedBlueprint({
  id: 'f1_martyrdom',
  collectable: true,
  name: 'Martyrdom',
  cost: 2,
  kind: 'SPELL',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_martyrdom',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: "Destroy a minion and heal its owner's General for the amount of Health that minion had.",
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              targets: {
                candidates: [
                  [{ type: 'is_manual_target_general', params: { index: 0, not: false } }]
                ],
                random: false
              },
              amount: {
                type: 'hp',
                params: {
                  unit: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                    ],
                    random: false
                  }
                }
              }
            }
          },
          {
            type: 'destroy_unit',
            params: {
              targets: manualTarget(0)
            }
          }
        ]
      },
      vfx: {
        tracks: [
          {
            filter: { candidates: [] },
            steps: [
              {
                type: 'playSfxOnEntity',
                params: {
                  duration: 2000,
                  resourceName: 'fx_f1_martyrdom',
                  animationName: 'default',
                  offset: { x: 0, y: -100 },
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  }
                }
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              {
                type: 'addLightOnEntity',
                params: {
                  duration: 1669,
                  alpha: 0.4,
                  blendMode: 1,
                  color: 13865219,
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  },
                  offset: { x: 0, y: -50 },
                  radius: 100
                }
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              { type: 'wait', params: { duration: 481 } },
              {
                type: 'playSfxOnEntity',
                params: {
                  duration: 1440,
                  resourceName: 'fx_martyrdom',
                  animationName: 'default',
                  offset: { x: 0, y: -30 },
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
});
