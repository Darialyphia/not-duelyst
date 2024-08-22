import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4BloodSiren = defineSerializedBlueprint({
  id: 'sEQz75',
  collectable: true,
  keywords: ['dying_wish'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_blood_siren',
  name: 'Blood Siren',
  cost: 2,
  attack: 3,
  maxHp: 2,
  faction: 'f4',
  effects: [
    {
      text: "@Dying Wish@: If it's your turn, heal your general for 3. If it's your opponent's turn, deal 3 damage to the enemy general.",
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: {
                candidates: [
                  [
                    {
                      type: 'active_player',
                      params: { player: { candidates: [[{ type: 'enemy_player' }]] } }
                    }
                  ]
                ],
                random: false
              },
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: {
                candidates: [
                  [
                    {
                      type: 'active_player',
                      params: { player: { candidates: [[{ type: 'ally_player' }]] } }
                    }
                  ]
                ],
                random: false
              },
              execute: 'now'
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
  ]
});
