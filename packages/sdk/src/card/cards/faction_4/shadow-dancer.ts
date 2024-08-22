import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4ShadowDancer = defineSerializedBlueprint({
  id: 'f4_shadow_dancer',
  collectable: true,
  keywords: ['deathwatch'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_shadowdancer',
  name: 'Shadow Dancer',
  cost: 5,
  attack: 4,
  maxHp: 4,
  faction: 'f4',
  effects: [
    {
      text: '@Deathwatch@: Deal 1 damage to the enemy general and heal your general for 1. ',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 0 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_destroyed',
            params: {
              unit: {
                candidates: [[{ type: 'is_self', params: { not: true } }]],
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
