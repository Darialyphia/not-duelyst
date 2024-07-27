import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f2KeshraiFanblade = defineSerializedBlueprint({
  id: 'f2_keshrai_fanblade',
  collectable: true,
  name: 'Keshrai Fanblade',
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  spriteId: 'f2_keshrai_fanblade',
  cost: 4,
  attack: 5,
  maxHp: 4,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: "@Opening Gambit@: Your opponent's spells cost 2 more until your next turn.",
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: [],
              execute: 'now',
              amount: fixedAmount(2),
              card: [[{ type: 'spell' }]],
              player: [[{ type: 'enemy_player' }]],
              occurences_count: 0,
              duration: 'start_of_next_turn'
            }
          }
        ]
      }
    })
  ]
});
