import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const f3Chronomancer = defineSerializedBlueprint({
  id: 'f3_chronomancer',
  name: 'Chronomancer',
  spriteId: 'f3_chronomancer',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: 'f3',
  effects: [
    {
      text: '@Opening Gambit@: The next spell you play this turn costs 2 less.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now',
              amount: { type: 'fixed', params: { value: -2 } },
              card: { candidates: [[{ type: 'spell' }]] },
              player: { candidates: [[{ type: 'ally_player' }]] },
              occurences_count: 1,
              duration: 'end_of_turn'
            }
          }
        ]
      }
    }
  ]
});
