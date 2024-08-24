import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralDioltas = defineSerializedBlueprint({
  id: 'neutral_dioltas',
  name: 'Dioltas',
  spriteId: 'neutral_dilotas',
  collectable: true,
  keywords: [KEYWORDS.DYING_WISH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 4,
  attack: 6,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Dying Wish@: Summon a @Tombstone@ on a random space nearby your General.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              blueprint: ['neutral_tombstone'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [
                            [
                              { type: 'is_ally', params: { not: false } },
                              { type: 'is_general', params: { not: false } }
                            ]
                          ],
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
      }
    }
  ]
});
