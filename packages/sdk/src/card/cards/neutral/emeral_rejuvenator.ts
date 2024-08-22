import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralEmeraldRejuvenator = defineSerializedBlueprint({
  id: 'neutral_emerald_rejuvenator',
  name: 'Emerald Rejuvenator',
  spriteId: 'neutral_emerald_rejuvenator',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: null,
  effects: [
    {
      text: '@Opening Gambit@: Restore 4 health to your general.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              amount: { type: 'fixed', params: { value: 4 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ],
                random: false
              },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
