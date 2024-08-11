import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralArchonSpellbinder = defineSerializedBlueprint({
  id: 'neutral_archon_spellbinder',
  spriteId: 'neutral_archon_spellbinder',
  name: 'Archon Spellbinder',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 6,
  attack: 6,
  maxHp: 7,
  faction: null,
  effects: [
    {
      text: "Your opponent's spells cost 1 more to play.",
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_card_cost',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              amount: { type: 'fixed', params: { value: 1 } },
              card: { candidates: [[{ type: 'spell' }]] },
              player: { candidates: [[{ type: 'enemy_player' }]] },
              occurences_count: 0,
              duration: 'always'
            }
          }
        ]
      }
    }
  ]
});
