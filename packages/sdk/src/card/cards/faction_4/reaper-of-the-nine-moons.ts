import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS } from '../../card-enums';

export const f4ReaperOfTheNineMoons = defineSerializedBlueprint({
  id: 'f4_reaper_of_the_nine_moons',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_reaper_nine_moons',
  cost: 4,
  attack: 5,
  maxHp: 3,
  faction: FACTION_IDS.F4,
  name: 'Reaper of the nine moons',
  effects: [
    {
      text: '@Fearsome@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'fearsome',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'When your opponent plays a spell that costs 3 or more, summon this behind the enemy general.',
      config: {
        executionContext: 'trigger_while_in_hand',
        actions: [
          {
            type: 'play_card',
            params: {
              card: { candidates: [[{ type: 'self' }]], random: false },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_behind',
                      params: {
                        unit: {
                          candidates: [
                            [
                              { type: 'is_general', params: { not: false } },
                              { type: 'is_enemy', params: { not: false } }
                            ]
                          ],
                          random: false
                        }
                      }
                    }
                  ]
                ],
                random: false
              },
              targets: { candidates: [], random: false },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_card_played',
            params: {
              card: {
                candidates: [
                  [
                    { type: 'spell', params: {} },
                    {
                      type: 'cost',
                      params: {
                        operator: 'more_than',
                        amount: { type: 'fixed', params: { value: 2 } }
                      }
                    }
                  ]
                ],
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
