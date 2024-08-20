import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Widowmaker = defineSerializedBlueprint({
  id: 'f2_widowmaker',
  name: 'Widowmaker',
  spriteId: 'f2_widowmaker',
  collectable: true,
  keywords: [KEYWORDS.ELUSIVE.id, KEYWORDS.BACKSTAB.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  faction: FACTION_IDS.F2,
  cost: 3,
  attack: 3,
  maxHp: 3,
  effects: [
    defineCardEffect({
      text: '@Elusive@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'elusive',
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
      text: '@Backstab@: 1.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'backstab',
            params: {
              filter: { candidates: [] },
              amount: { type: 'fixed', params: { value: 1 } },
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
