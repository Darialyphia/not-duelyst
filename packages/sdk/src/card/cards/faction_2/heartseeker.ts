import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Heartseeker = defineSerializedBlueprint({
  id: 'f2_heartseeker',
  collectable: true,
  name: 'Heartseeker',
  spriteId: 'f2_heartseeker',
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cost: 1,
  attack: 1,
  maxHp: 1,
  faction: FACTION_IDS.F2,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  effects: [
    {
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
    }
  ]
});
