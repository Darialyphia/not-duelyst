import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f1LastingJudgement = defineSerializedBlueprint({
  id: 'f1_lasting_judgment',
  collectable: true,
  name: 'Lasting Judgement',
  cost: 2,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_lasting_judgement',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Give a minion +3 / -3',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: manualTarget(0),
              mode: 'give',
              attack: { amount: { type: 'fixed', params: { value: 3 } } },
              hp: { amount: { type: 'fixed', params: { value: -3 } } },
              stackable: true
            }
          }
        ]
      }
    }
  ]
});
