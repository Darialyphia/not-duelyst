import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralVoidHunter = defineSerializedBlueprint({
  id: 'neutral_void_hunter',
  spriteId: 'neutral_void_hunter',
  name: 'Void Hunter',
  collectable: true,
  keywords: [KEYWORDS.DYING_WISH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 4,
  maxHp: 2,
  faction: null,
  effects: [
    {
      text: '@Dying Wish@: Draw 2 cards',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              filter: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_destroyed',
            params: {
              unit: { candidates: [], random: false },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
