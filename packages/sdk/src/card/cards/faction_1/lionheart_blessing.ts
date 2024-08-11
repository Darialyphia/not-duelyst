import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { allyMinion } from '../../helpers/targeting';

export const f1LionheartBlessing = defineSerializedBlueprint({
  id: 'lionheart_blessing',
  collectable: true,
  name: 'Lionheart Blessing',
  cost: 0,
  kind: 'SPELL',
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.ZEAL.id],
  rarity: RARITIES.EPIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_lionheart_blessing',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: allyMinion() }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Give an ally minion "@Zeal@: When this deals damage, draw a card".',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { index: 0, not: false } }]
                ],
                random: false
              },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'zeal',
                    params: {
                      effect: {
                        executionContext: 'trigger_while_on_board',
                        triggers: [
                          {
                            type: 'on_after_unit_deal_damage',
                            params: {
                              frequency: { type: 'always' },
                              target: {
                                candidates: [],
                                random: false
                              },
                              unit: {
                                candidates: [
                                  [{ type: 'is_self', params: { not: false } }]
                                ],
                                random: false
                              }
                            }
                          }
                        ],
                        actions: [
                          {
                            type: 'draw_cards',
                            params: {
                              player: {
                                candidates: [[{ type: 'attack_source_owner' }]],
                                random: false
                              },
                              amount: { type: 'fixed', params: { value: 1 } }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ]
});
