import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4ShadowWatcher = defineSerializedBlueprint({
  id: 'f4_shadow_watcher',
  collectable: true,
  keywords: ['deathwatch'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Deathwatch@: This gains +1/+1',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [], random: false }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [], random: false }
              },
              speed: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
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
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_shadow_watcher',
  name: 'Shadow Watcher',
  cost: 3,
  attack: 2,
  maxHp: 2,
  faction: 'f4'
});
