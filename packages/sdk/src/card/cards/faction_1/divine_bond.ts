import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { cellWithAnyMinion, manualTarget } from '../../helpers/targeting';

export const f1DivineBond = defineSerializedBlueprint({
  id: 'divine_bond',
  collectable: true,
  name: 'Divine Bond',
  cost: 3,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_divine_bond',
  tags: [],
  targets: {
    min: 1,
    targets: [cellWithAnyMinion()]
  },
  effects: [
    {
      text: "Set a minion's attack equal to its health.",
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: manualTarget(0),
              stackable: false,
              mode: 'set',
              attack: {
                amount: { type: 'hp', params: { unit: manualTarget(0) } }
              }
            }
          }
        ]
      }
    }
  ]
});
