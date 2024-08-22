import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4AbyssalCrawler = defineSerializedBlueprint({
  id: 'f4_abyssal_crawler',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_abyssal_crawler',
  name: 'Abyssal Crawler',
  cost: 1,
  attack: 2,
  maxHp: 1,
  faction: 'f4',
  effects: [
    {
      text: 'At the end of your turn, create a Shadow Creep tile under this unit.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'create_tile',
            params: {
              execute: 'now',
              filter: { candidates: [], random: false },
              player: { candidates: [[{ type: 'ally_player' }]] },
              tile: 'shadow_creep',
              position: {
                candidates: [
                  [
                    {
                      type: 'has_unit',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ],
        triggers: [
          {
            type: 'on_player_turn_end',
            params: {
              player: {
                candidates: [[{ type: 'ally_player', params: {} }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
