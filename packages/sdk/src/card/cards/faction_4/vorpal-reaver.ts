import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4VorpalReaver = defineSerializedBlueprint({
  id: 'f4_vorpal_reaver',
  collectable: true,
  keywords: ['celerity', 'dying_wish'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_vorpal_reaver',
  name: 'Vorpal Reaver',
  cost: 6,
  attack: 6,
  maxHp: 6,
  faction: 'f4',
  effects: [
    {
      text: '@Celerity@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'celerity',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Dying Wish@: Summon 6 @Wraithlin@ on random spaces.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
            }
          },
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['f4_wraithling'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: { candidates: [[{ type: 'is_empty' }]], random: true }
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
