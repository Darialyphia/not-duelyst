import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralArakiHeadhunter = defineSerializedBlueprint({
  id: 'neutral_araki_headhunter',
  name: 'Araki Headhunter',
  spriteId: 'neutral_araki_headhunter',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 3,
  faction: null,
  targets: { min: 0, targets: [] },
  effects: [
    defineCardEffect({
      text: 'When you play a minion with @Opening Gambit@, this minion gains +2 / +0.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 2 } },
                activeWhen: { candidates: [] }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 0 } },
                activeWhen: { candidates: [] }
              },
              targets: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              filter: { candidates: [] },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: {
                candidates: [
                  [
                    {
                      type: 'has_keyword',
                      params: { keyword: 'opening_gambit', not: false }
                    },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ]
              },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    })
  ]
});
