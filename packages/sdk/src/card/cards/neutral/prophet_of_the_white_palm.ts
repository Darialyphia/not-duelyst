import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralProphetOfTheWhitePalm = defineSerializedBlueprint({
  id: 'neutral_prophet_thewhite_palm',
  name: 'Prophet of the White Palm ',
  spriteId: 'neutral_prophet_of_the_white_palm',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 1,
  attack: 2,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: Give all units "This takes no damage from spells" until your next turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_damage_taken',
            params: {
              unit: { candidates: [[{}]] },
              effect: { actions: [] },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now',
              mode: 'set',
              stackable: true,
              targets: { candidates: [[{ type: 'any_unit' }]] },
              source: { candidates: [[{ type: 'spell' }]] },
              frequency: { type: 'always' },
              duration: 'start_of_next_turn',
              amount: { type: 'fixed', params: { value: 0 } }
            }
          }
        ]
      }
    }
  ]
});
