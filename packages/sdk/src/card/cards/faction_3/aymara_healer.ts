import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3AymaraHealer = defineSerializedBlueprint({
  id: 'f3_aymara_healer',
  spriteId: 'f3_aymara_healer',
  name: 'Aymara Healer',
  collectable: true,
  keywords: [KEYWORDS.PROVOKE.id, KEYWORDS.DYING_WISH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 6,
  attack: 6,
  maxHp: 6,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Provoke@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'provoke',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    },
    {
      text: '@Dying Wish@: Deal 5 damage to the enemy general and heal your general for 5.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          },
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 5 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_destroyed',
            params: {
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    },
    {
      text: '@Essence(2)@: Deal 2 damage to the enemy general and heal your general for 2.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'essence',
            params: {
              execute: 'now',
              targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
              filter: { candidates: [], random: false },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'deal_damage',
                    params: {
                      amount: { type: 'fixed', params: { value: 2 } },
                      targets: {
                        candidates: [
                          [
                            { type: 'is_enemy', params: { not: false } },
                            { type: 'is_general', params: { not: false } }
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
                      amount: { type: 'fixed', params: { value: 2 } },
                      targets: {
                        candidates: [
                          [
                            { type: 'is_general', params: { not: false } },
                            { type: 'is_ally', params: { not: false } }
                          ]
                        ],
                        random: false
                      },
                      filter: { candidates: [], random: false },
                      execute: 'now'
                    }
                  }
                ]
              },
              cost: 2
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
