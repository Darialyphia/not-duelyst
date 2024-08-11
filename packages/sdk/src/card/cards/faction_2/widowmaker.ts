import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Widowmaker = defineSerializedBlueprint({
  id: 'f2_widowmaker',
  name: 'Widowmaker',
  spriteId: 'f2_widowmaker',
  collectable: true,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  faction: FACTION_IDS.F2,
  cost: 3,
  attack: 3,
  maxHp: 1,
  effects: [
    defineCardEffect({
      text: '@Ranged@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'ranged',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    }),
    defineCardEffect({
      text: 'When this attacks, draw a card at the end of your turn.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]] },
              filter: { candidates: [] },
              execute: 'end_of_turn'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_attack',
            params: {
              target: { candidates: [] },
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    })
  ]
});
