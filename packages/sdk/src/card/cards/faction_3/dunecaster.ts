import { KEYWORDS } from '../../../utils/keywords';
import { TAGS } from '../../../utils/tribes';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { f3WindDervish } from './wind-dervish';

export const f3Dunecaster = defineSerializedBlueprint({
  id: 'f3_dunecaster',
  name: 'Dunecaster',
  spriteId: 'f3_dunecaster',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [f3WindDervish.id],
  tags: [TAGS.DERVISH.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  attack: 2,
  maxHp: 1,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Opening Gambit@: give +2/+2 and remove @Ephemeral@ to an ally @Dervish@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              },
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'remove_keyword',
            params: {
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              execute: 'now',
              keyword: 'ephemeral',
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ]
              }
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'has_tag', params: { tag: 'dervish', not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ]
              }
            }
          }
        ]
      ]
    ]
  }
});
