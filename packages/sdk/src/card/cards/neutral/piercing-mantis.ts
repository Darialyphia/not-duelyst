import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralPiercingMantis = defineSerializedBlueprint({
  id: 'neutral_piercing_mantis',
  name: 'Piercing Mantis',
  spriteId: 'neutral_piercing_mantis',
  collectable: true,
  keywords: ['frenzy'],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Frenzy@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'frenzy',
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
