import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { manualTarget } from '../../helpers/targeting';

export const f1SundropElixir = defineSerializedBlueprint({
  id: 'f1_sundrop_elixir',
  collectable: true,
  name: 'Sundrop Elixir',
  cost: 1,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_sundrop_elixir',
  tags: [],
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
  },
  effects: [
    {
      text: 'Heal a unit for 5.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'heal',
            params: {
              targets: manualTarget(0),
              amount: { type: 'fixed', params: { value: 5 } }
            }
          }
        ]
      }
    }
  ]
});
