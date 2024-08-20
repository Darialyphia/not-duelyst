import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralFlameAcolyte = defineSerializedBlueprint({
  id: 'neutral_flame_acolyte',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  effects: [
    {
      text: 'When you cast a spell that costs more than 0, summon a @Spellspark@ on a random nearby space.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['neutral_spellspark'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    { type: 'is_empty' },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        },
                        cell: { candidates: [], random: false }
                      }
                    }
                  ]
                ],
                random: true
              }
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
                      type: 'from_player',
                      params: {
                        player: { candidates: [[{ type: 'ally_player' }]], random: false }
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
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_firestarter',
  name: 'Flame Acolyte',
  cost: 5,
  attack: 3,
  maxHp: 6,
  faction: null
});
