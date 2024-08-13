import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3ScionsFirstWish = defineSerializedBlueprint({
  id: 'scions_first_wish',
  spriteId: 'icon_f3_scions_first_wish',
  name: "Scion's First Wish",
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 1,
  faction: FACTION_IDS.F3,
  effects: [
    defineCardEffect({
      text: 'Give a minion +1/+1. Draw a card.',
      vfx: {
        tracks: [
          {
            filter: { candidates: [] },
            steps: [
              {
                type: 'tintScreen',
                params: {
                  alpha: 0.5,
                  color: '#ff0000',
                  duration: 2000,
                  blendMode: 2
                }
              },
              { type: 'wait', params: { duration: 500 } },
              {
                type: 'playSfxOnEntity',
                params: {
                  resourceName: 'fx_f3_scionsfirstwish',
                  animationName: 'default',
                  duration: 31 * 64,
                  offset: { x: 0, y: -50 },
                  entity: {
                    candidates: [
                      [
                        {
                          type: 'is_manual_target',
                          params: {
                            not: false,
                            index: 0
                          }
                        }
                      ]
                    ]
                  }
                }
              },
              {
                type: 'bloomScreen',
                params: {
                  duration: 1000,
                  strength: 0.6
                }
              },
              {
                type: 'shockwaveOnScreenCenter',
                params: {
                  duration: 500,
                  offset: { x: 0, y: 0 },
                  radius: 800,
                  wavelength: 200
                }
              },
              {
                type: 'shockwaveOnScreenCenter',
                params: {
                  duration: 500,
                  offset: { x: 0, y: 0 },
                  radius: 800,
                  wavelength: 400
                }
              },
              {
                type: 'shockwaveOnScreenCenter',
                params: {
                  duration: 500,
                  offset: { x: 0, y: 0 },
                  radius: 1200,
                  wavelength: 400
                }
              },
              {
                type: 'shockwaveOnScreenCenter',
                params: {
                  duration: 500,
                  offset: { x: 0, y: 0 },
                  radius: 1200,
                  wavelength: 400
                }
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              {
                type: 'shakeScreen',
                params: { amplitude: 15, duration: 2000, isBidirectional: true }
              },
              {
                type: 'shakeEntity',
                params: {
                  entity: {
                    candidates: [[{ type: 'is_general', params: { not: false } }]]
                  },
                  amplitude: 10,
                  duration: 1000,
                  isBidirectional: false
                }
              }
            ]
          }
        ]
      },
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              filter: { candidates: [] },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]] },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    })
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: { candidates: [[{ type: 'is_minion', params: { not: false } }]] }
            }
          }
        ]
      ]
    ]
  }
});
