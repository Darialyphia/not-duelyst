import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { zealCondition } from '../../helpers/conditions';

export const f1SuntideMaiden = defineSerializedBlueprint({
  id: 'suntide_maiden',
  collectable: true,
  name: 'Suntide Maiden',
  cost: 4,
  attack: 3,
  maxHp: 6,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ZEAL.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_suntide_maiden',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Zeal@: At the end of your turn, this fully heals.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_player_turn_end',
            params: {
              player: [[{ type: 'ally_player' }]]
            }
          }
        ],
        actions: [
          {
            type: 'heal',
            params: {
              targets: [[{ type: 'is_self' }]],
              amount: { type: 'maxHp', params: { unit: [[{ type: 'is_self' }]] } },
              filter: zealCondition()
            }
          }
        ]
      }
    })
  ]
});
