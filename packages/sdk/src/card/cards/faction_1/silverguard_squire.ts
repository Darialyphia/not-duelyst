import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyGeneral } from '../../helpers/targeting';

export const f1SilverguardSquire = defineSerializedBlueprint({
  id: 'f1_silverguard_squire',
  collectable: true,
  name: 'Silverguard Squire',
  cost: 1,
  attack: 1,
  maxHp: 1,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'f1_silverguard_squire',
  tags: [],
  effects: [
    {
      text: '@Opening Gambit@: Give allies directly in front and behind your general +1/+1',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: {
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    {
                      type: 'is_in_front',
                      params: { unit: allyGeneral(), not: false }
                    }
                  ],
                  [
                    { type: 'is_ally', params: { not: false } },
                    {
                      type: 'is_behind',
                      params: { unit: allyGeneral(), not: false }
                    }
                  ]
                ],
                random: false
              },
              filter: { candidates: [[{ type: 'played_from_hand', params: {} }]] },
              mode: 'give',
              attack: { amount: { type: 'fixed', params: { value: 1 } } },
              hp: { amount: { type: 'fixed', params: { value: 1 } } },
              stackable: true
            }
          }
        ]
      }
    }
  ]
});
