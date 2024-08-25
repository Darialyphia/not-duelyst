import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS } from '../../card-enums';

export const f5Phalanxar = defineSerializedBlueprint({
  id: 'f5_phalanxar',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  faction: FACTION_IDS.F5,
  effects: [
    {
      text: 'This moves 1 les space.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [], random: false }
              },
              speed: {
                amount: { type: 'fixed', params: { value: -1 } },
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
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_phalanxar',
  name: 'Phalanxar',
  cost: 2,
  attack: 4,
  maxHp: 4
});
