import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3StarfireScarab = defineSerializedBlueprint({
  id: 'f3_starfire_scarab',
  spriteId: 'f3_starfire_scarab',
  name: 'Starfire Scarab',
  collectable: true,
  keywords: [KEYWORDS.BLAST.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 5,
  attack: 4,
  maxHp: 7,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Blast@.',
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
    }
  ]
});
