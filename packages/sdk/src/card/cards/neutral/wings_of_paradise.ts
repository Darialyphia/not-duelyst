import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralWingsOfParadise = defineSerializedBlueprint({
  id: 'neutral_wings_of_paradise',
  name: 'Wings of Paradise',
  spriteId: 'neutral_wings_of_paradise',
  collectable: true,
  keywords: [KEYWORDS.FLYING.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Flying@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'flying',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              activeWhen: { candidates: [] }
            }
          }
        ]
      }
    },
    {
      text: 'When you replace a card, this gains +2/+0 this turn.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              targets: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              filter: { candidates: [] },
              duration: 'end_of_turn',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_player_replace',
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
