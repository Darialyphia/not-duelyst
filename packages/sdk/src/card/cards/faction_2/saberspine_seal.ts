import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f2SaberspineSeal = defineSerializedBlueprint({
  id: 'f2_saberspine_seal',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  name: 'Saberspine Seal',
  spriteId: 'icon_f2_saberspine_seal',
  cost: 1,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: 'Give a unit +3/+0 this turn.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [] }
              },
              targets: manualTarget(0),
              filter: { candidates: [] },
              duration: 'end_of_turn',
              execute: 'now'
            }
          }
        ]
      }
    })
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: { candidates: [[{ type: 'any_unit' }]], random: false } }
          }
        ]
      ]
    ]
  }
});
