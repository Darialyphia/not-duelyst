import { KEYWORDS } from '../../../utils/keywords';
import { TAGS } from '../../../utils/tribes';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3WindDervish = defineSerializedBlueprint({
  id: 'f3_wind_dervish',
  spriteId: 'f3_dervish',
  name: 'Wind Dervish',
  collectable: false,
  keywords: [KEYWORDS.RUSH.id, KEYWORDS.EPHEMERAL.id],
  relatedBlueprintIds: [],
  tags: [TAGS.DERVISH.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 1,
  attack: 2,
  maxHp: 2,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Rush@.',
      config: { actions: [{ type: 'rush', params: {} }], executionContext: 'immediate' }
    },
    {
      text: '@Ephemeral@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'ephemeral',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              activeWhen: { candidates: [] }
            }
          }
        ]
      }
    }
  ]
});
