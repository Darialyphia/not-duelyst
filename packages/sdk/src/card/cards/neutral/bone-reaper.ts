import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralBonereaper = defineSerializedBlueprint({
  id: 'neutral_bonereaper',
  collectable: true,
  keywords: [KEYWORDS.PROVOKE.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'neutral_bonereaper',
  name: 'Bonereaper',
  cost: 6,
  attack: 2,
  maxHp: 10,
  faction: null,
  effects: [
    { text: '@Provoke@.', config: { executionContext: 'immediate', actions: [] } },
    {
      text: 'At the end of your turn, deal 2 damage to nearby enemy minions.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_minion', params: { not: false } },
                    { type: 'is_enemy', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        },
                        not: false
                      }
                    }
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
            type: 'on_player_turn_end',
            params: {
              player: { candidates: [[{ type: 'ally_player', params: {} }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
