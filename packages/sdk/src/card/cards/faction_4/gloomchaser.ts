import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4Gloomchaser = defineSerializedBlueprint({
  id: 'f4_gloomchaser',
  collectable: true,
  keywords: ['opening_gambit'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Opening Gambit@: Summon a @Wraithling@ behind this.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: {
                candidates: [[{ type: 'played_from_hand', params: {} }]],
                random: false
              },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_behind',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        }
                      }
                    }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_gloomchaser',
  name: 'Gloomchaser',
  cost: 2,
  attack: 3,
  maxHp: 1,
  faction: 'f4'
});
