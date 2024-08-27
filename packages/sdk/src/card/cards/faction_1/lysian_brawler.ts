import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f1LysianBrawler = defineSerializedBlueprint({
  id: 'f1_lysian_brawler',
  collectable: true,
  name: 'Lysian Brawler',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ADAPT.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'f1_lysian_brawler',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Adapt@: +1/+0 and @Celerity@ OR +0/+1 and @Tough@: 1.',
      config: {
        executionContext: 'while_in_hand',
        actions: [
          {
            type: 'adapt',
            params: {
              choices: [
                {
                  text: '+1/+0 and @Celerity@.',
                  effect: {
                    executionContext: 'while_on_board',
                    actions: [
                      {
                        type: 'change_stats',
                        params: {
                          mode: 'give',
                          stackable: true,
                          targets: {
                            candidates: [[{ type: 'is_self', params: { not: false } }]]
                          },
                          attack: { amount: { type: 'fixed', params: { value: 1 } } }
                        }
                      },
                      { type: 'celerity', params: {} }
                    ]
                  }
                },
                {
                  text: '+0/+1 and @Tough@.',
                  effect: {
                    executionContext: 'while_on_board',
                    actions: [
                      {
                        type: 'change_stats',
                        params: {
                          mode: 'give',
                          stackable: true,
                          targets: {
                            candidates: [[{ type: 'is_self', params: { not: false } }]]
                          },
                          hp: { amount: { type: 'fixed', params: { value: 1 } } }
                        }
                      },
                      {
                        type: 'tough',
                        params: { stacks: { type: 'fixed', params: { value: 1 } } }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    })
  ]
});
