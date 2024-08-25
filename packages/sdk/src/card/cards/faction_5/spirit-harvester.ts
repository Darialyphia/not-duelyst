import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5SpiritHarvester = defineSerializedBlueprint({
  id: 'f5_spirit_harvester',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
  effects: [
    {
      text: 'At the end of your turn, deal 1 damage to other minions.',
      config: {
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    { type: 'is_self', params: { not: true } }
                  ]
                ],
                random: false
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ],
        executionContext: 'trigger_while_on_board',
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
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_spirit_harvester',
  name: 'Spirit Harvester',
  cost: 5,
  attack: 5,
  maxHp: 5,
  faction: 'f5'
});
