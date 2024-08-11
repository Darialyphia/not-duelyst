import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2ScarletViper = defineSerializedBlueprint({
  id: 'f2_scarlet_viper',
  cellHighlights: [],
  name: 'Scarlet Viper',
  spriteId: 'f2_scarlet_viper',
  cost: 5,
  attack: 3,
  maxHp: 5,
  faction: FACTION_IDS.F2,
  collectable: true,
  keywords: [KEYWORDS.FLYING.id, KEYWORDS.BACKSTAB.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  effects: [
    {
      text: '@Flying@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'flying',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    },
    {
      text: '@Backstab@: 3',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'backstab',
            params: {
              filter: { candidates: [] },
              activeWhen: { candidates: [] },
              amount: { type: 'fixed', params: { value: 3 } },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
