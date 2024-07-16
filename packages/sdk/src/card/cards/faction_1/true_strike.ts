import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { cellWithEnemyMinion, manualTarget } from '../../helpers/targeting';

export const f1TrueStrike = defineSerializedBlueprint({
  id: 'true_strike',
  collectable: true,
  name: 'True Strike',
  cost: 1,
  kind: 'SPELL',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: 'common',
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_truestrike',
  tags: [],
  targets: {
    min: 1,
    targets: [cellWithEnemyMinion()]
  },
  effects: [
    {
      text: 'Deal 2 damage to an enemy minion.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              targets: manualTarget(0),
              amount: fixedAmount(2)
            }
          }
        ]
      }
    }
  ]
});
