import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { openingGambitEffect } from '../../helpers/opening-gambit.effect';
import { allyGeneral } from '../../helpers/targeting';

export const f1SilverguardSquire = defineSerializedBlueprint({
  id: 'silverguard_squire',
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
  speed: 2,
  spriteId: 'f1_silverguard_squire',
  tags: [],
  effects: [
    openingGambitEffect({
      text: 'Give allies directly in front and behind your general +1/+1',
      actions: [
        {
          type: 'change_stats',
          params: {
            targets: [
              [
                { type: 'is_ally' },
                {
                  type: 'is_in_front',
                  params: { unit: allyGeneral() }
                }
              ],
              [
                { type: 'is_ally' },
                {
                  type: 'is_behind',
                  params: { unit: allyGeneral() }
                }
              ]
            ],
            mode: 'give',
            attack: { amount: { type: 'fixed', params: { value: 1 } } },
            hp: { amount: { type: 'fixed', params: { value: 1 } } },
            stackable: true
          }
        }
      ]
    })
  ]
});
