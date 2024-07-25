import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { cellWithAllyMinion } from '../../helpers/targeting';

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
    targets: [cellWithAllyMinion()]
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
              unit: [[{ type: 'is_manual_target', params: { index: 0 } }]],
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'zeal',
                    params: {
                      effect: {
                        executionContext: 'while_on_board',
                        triggers: [
                          {
                            type: 'on_after_unit_deal_damage',
                            params: {
                              frequency: { type: 'always' },
                              target: [],
                              unit: [[{ type: 'is_self' }]]
                            }
                          }
                        ],
                        actions: [
                          {
                            type: 'draw_cards',
                            params: {
                              player: [[{ type: 'attack_source_owner' }]],
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
