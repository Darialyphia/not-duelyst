import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2KaidoAssassin = defineSerializedBlueprint({
  id: 'f2_kaido_assassin',
  collectable: true,
  name: 'Kaido Assassin',
  spriteId: 'f2_kaido_assasin',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: FACTION_IDS.F2,
  keywords: [KEYWORDS.BACKSTAB.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  effects: [
    {
      text: '@Backstab@: 2.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'backstab',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              amount: { type: 'fixed', params: { value: 2 } }
            }
          }
        ]
      }
    }
  ]
});
