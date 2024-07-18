import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { anyOccupiedCell, manualTarget } from '../../helpers/targeting';

export const f1SundropElixir = defineSerializedBlueprint({
  id: 'sundrop_elixir',
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
    targets: [anyOccupiedCell()]
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
              amount: fixedAmount(5)
            }
          }
        ]
      }
    }
  ]
});
