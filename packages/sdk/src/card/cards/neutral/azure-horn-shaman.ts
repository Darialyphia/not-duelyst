import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralAzureHornShaman = defineSerializedBlueprint({
  id: 'neutral_azure_horn_shaman',
  spriteId: 'boss_azure_horn_shaman',
  name: 'Azure Horn Shaman',
  collectable: true,
  keywords: [KEYWORDS.DYING_WISH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 4,
  faction: null,
  effects: [
    {
      text: '@Dying Wish@: Give nearby ally minions +0/+4.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_minion', params: { not: false } },
                    {
                      type: 'is_nearby',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_self', params: { not: false } }]]
                        },
                        not: false
                      }
                    }
                  ]
                ]
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      hp: {
                        amount: { type: 'fixed', params: { value: 4 } },
                        activeWhen: { candidates: [] }
                      },
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]]
                      },
                      filter: { candidates: [] },
                      duration: 'always',
                      execute: 'now'
                    }
                  }
                ]
              }
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_destroyed',
            params: {
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
