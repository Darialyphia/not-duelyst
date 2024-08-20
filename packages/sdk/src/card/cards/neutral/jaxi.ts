import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralJaxi = defineSerializedBlueprint({
  id: 'neutral_jaxi',
  collectable: true,
  keywords: ['dying_wish'],
  relatedBlueprintIds: ['neutral_mini_jax'],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Dying Wish@: summon a @Mini-jax@ on this space.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['neutral_mini_jax'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
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
                ],
                random: false
              }
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_destroyed',
            params: {
              unit: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_jaxi',
  name: 'Jaxi',
  cost: 2,
  attack: 3,
  maxHp: 1,
  faction: null
});
