import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { f3WindDervish } from './wind-dervish';

export const f3FireblazeObelisk = defineSerializedBlueprint({
  id: 'f3_fireblaze_obelisk',
  collectable: true,
  keywords: [KEYWORDS.SPAWN.id],
  relatedBlueprintIds: [f3WindDervish.id],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  effects: [
    {
      text: '@Spawn@: @Wind Dervish@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'spawn',
            params: {
              blueprint: ['f3_wind_dervish'],
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'Allied @dervishes@ have +1/+0.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'aura',
            params: {
              isElligible: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'has_tag', params: { not: false, tag: 'dervish' } }
                  ]
                ]
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]]
                      },
                      attack: {
                        amount: fixedAmount(1)
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'is_nearby',
            params: {
              unit: { candidates: [] },
              cell: { candidates: [[{ type: 'summon_target' }]] }
            }
          }
        ]
      ]
    ]
  },
  spriteId: 'f3_fireblaze_obelysk',
  name: 'Fireblaze Obelisk',
  cost: 3,
  attack: 0,
  maxHp: 6,
  faction: 'f3'
});
