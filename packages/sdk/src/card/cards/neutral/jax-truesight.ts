import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralJaxTruesight = defineSerializedBlueprint({
  id: 'neutral_jax_truesight',
  name: 'Jax Truesight',
  spriteId: 'neutral_jax_truesight',
  collectable: true,
  keywords: [KEYWORDS.RANGED.id, KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: ['neutral_mini_jax'],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 6,
  attack: 1,
  maxHp: 1,
  faction: null,
  effects: [
    {
      text: '@Ranged@.',
      config: {
        executionContext: 'while_on_board',
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
    },
    {
      text: '@Opening Gambit@: Summon a @Mini-jax@ on each corner of the battlefield.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now',
              blueprint: ['neutral_mini_jax'],
              player: { candidates: [[{ type: 'ally_player' }]] },
              position: {
                candidates: [
                  [{ type: 'is_top_left_corner' }],
                  [{ type: 'is_top_right_corner', params: {} }],
                  [{ type: 'is_bottom_left_corner', params: {} }],
                  [{ type: 'is_bottom_right_corner', params: {} }]
                ]
              }
            }
          }
        ]
      }
    }
  ]
});
