import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3Pyromancer = defineSerializedBlueprint({
  id: 'f3_pyromancer',
  name: 'Pyromancer',
  spriteId: 'f3_pyromancer',
  collectable: true,
  keywords: [KEYWORDS.BLAST.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 1,
  faction: FACTION_IDS.F3,
  effects: [
    defineCardEffect({
      text: 'Your effect Text',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'blast',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      }
    })
  ]
});
