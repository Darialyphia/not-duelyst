import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { provokeEffect } from '../../helpers/provoke.effect';
import { cellWithAllyMinion, manualTarget } from '../../helpers/targeting';

export const f1ElyxStormblade = defineSerializedBlueprint({
  id: 'elyx_stormblade',
  collectable: true,
  name: 'Elyx Stormblade',
  cost: 7,
  attack: 7,
  maxHp: 7,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.PROVOKE.id, KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.CELERITY.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  relatedBlueprintIds: [],
  spriteId: 'f1_elyx_stormblade',
  tags: [],
  targets: { min: 0, targets: [cellWithAllyMinion()] },
  effects: [
    provokeEffect(),
    defineCardEffect({
      text: '@Opening Gambit@: give an ally minion @Celerity@',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: manualTarget(0),
              effect: {
                executionContext: 'immediate',
                actions: [{ type: 'celerity', params: {} }]
              }
            }
          }
        ]
      }
    })
  ]
});
