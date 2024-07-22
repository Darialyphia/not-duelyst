import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f1ArclyteSentinel = defineSerializedBlueprint({
  id: 'arclyte_sentinel',
  collectable: true,
  name: 'Arclyte Sentinel',
  cost: 3,
  attack: 2,
  maxHp: 4,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'f1_arclyte_sentinel',
  tags: [],
  targets: {
    min: 0,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: [
                [
                  { type: 'is_minion' },
                  { type: 'is_nearby', params: { cell: [[{ type: 'summon_target' }]] } }
                ]
              ]
            }
          }
        ]
      ]
    ]
  },
  effects: [
    defineCardEffect({
      text: '@Opening Gambit@: Give a nearby minion +2/-2.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: manualTarget(0),
              mode: 'give',
              attack: { amount: { type: 'fixed', params: { value: 2 } } },
              hp: { amount: { type: 'fixed', params: { value: -2 } } },
              stackable: true
            }
          }
        ]
      }
    })
  ]
});
