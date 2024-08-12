import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralLuxIgnis = defineSerializedBlueprint({
  id: 'neutral_lux_ignis',
  spriteId: 'neutral_lux_ignis',
  name: 'Lux Ignis',
  collectable: true,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 5,
  attack: 2,
  maxHp: 5,
  faction: null,
  effects: [
    {
      text: '@Ranged@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'ranged',
            params: {
              execute: 'now'
            }
          }
        ]
      }
    },
    {
      text: 'At the end of your turn, heal nearby allies by 2.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]],
                          random: false
                        },
                        cell: { candidates: [], random: false },
                        not: false
                      }
                    }
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
      }
    }
  ]
});
