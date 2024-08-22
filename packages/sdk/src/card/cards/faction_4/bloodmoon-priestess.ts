import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4BloodmoonPriestess = defineSerializedBlueprint({
  id: 'f4_bloodmoon-priestess',
  collectable: true,
  keywords: ['deathwatch'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_bloodmoon_priestess',
  name: 'Bloodmoon Priestess',
  cost: 4,
  attack: 3,
  maxHp: 3,
  faction: 'f4',
  effects: [
    {
      text: '@Deathwatch@: Summon a @Wraithling@ on a random nearby space.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['bNFeb9'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        },
                        cell: { candidates: [], random: false }
                      }
                    },
                    { type: 'is_empty' }
                  ]
                ],
                random: true
              }
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
