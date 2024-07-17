import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { openingGambitEffect } from '../../helpers/opening-gambit.effect';
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
  speed: 2,
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
                  { type: 'any_unit' },
                  { type: 'is_nearby', params: { unit: [[{ type: 'is_self' }]] } }
                ]
              ]
            }
          }
        ]
      ]
    ]
  },
  effects: [
    openingGambitEffect({
      text: 'Give a nearby minion +2/-2.',
      actions: [
        {
          type: 'change_stats',
          params: {
            targets: manualTarget(0),
            attack: { amount: { type: 'fixed', params: { value: 2 } } },
            hp: { amount: { type: 'fixed', params: { value: -2 } } },
            stackable: true
          }
        }
      ]
    })
  ]
});
