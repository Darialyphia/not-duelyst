import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5Kujata = defineSerializedBlueprint({
  id: 'f5_kujata',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  effects: [
    {
      text: 'Your minions cost 1 less to play.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now',
              amount: { type: 'fixed', params: { value: -1 } },
              card: { candidates: [[{ type: 'minion' }]], random: false },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              occurences_count: 0,
              duration: 'always'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'When you play a minion, deal one damage to it.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [[{ type: 'played_unit', params: { not: false } }]],
                random: false
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ],
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              frequency: { type: 'always' },
              unit: {
                candidates: [[{ type: 'is_ally', params: { not: false } }]],
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
  spriteId: 'f5_kujata',
  name: 'Kujata',
  cost: 2,
  attack: 2,
  maxHp: 2,
  faction: 'f5'
});
