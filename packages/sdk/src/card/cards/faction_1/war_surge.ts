import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyMinion } from '../../helpers/targeting';

export const f1WarSurge = defineSerializedBlueprint({
  id: 'f1_war_surge',
  collectable: true,
  name: 'War Surge',
  cost: 2,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_warsurge',
  tags: [],
  targets: {
    min: 1,
    targets: [[[{ type: 'any_cell' }]]]
  },
  effects: [
    {
      text: 'Give allied minions +1/+1.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              targets: allyMinion(),
              stackable: false,
              mode: 'give',
              attack: {
                amount: { type: 'fixed', params: { value: 1 } }
              },
              hp: {
                amount: { type: 'fixed', params: { value: 1 } }
              }
            }
          }
        ]
      }
    }
  ]
});
