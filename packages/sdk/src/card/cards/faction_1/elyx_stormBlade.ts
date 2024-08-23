import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { provokeEffect } from '../../helpers/provoke.effect';

export const f1ElyxStormblade = defineSerializedBlueprint({
  id: 'f1_elyx_stormblade',
  collectable: true,
  name: 'Elyx Stormblade',
  cost: 7,
  attack: 7,
  maxHp: 7,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.PROVOKE.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  relatedBlueprintIds: [],
  spriteId: 'f1_elyx_stormblade',
  tags: [],
  targets: {
    min: 0,
    targets: []
  },
  effects: [
    provokeEffect(),
    defineCardEffect({
      text: 'Your minions and general can move an additional space.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              targets: {
                candidates: [[{ type: 'is_self', params: { not: false } }]]
              },
              speed: {
                amount: { type: 'fixed', params: { value: 1 } }
              }
            }
          },
          {
            type: 'aura',
            params: {
              isElligible: {
                candidates: [[{ type: 'is_ally', params: { not: false } }]]
              },
              effect: {
                executionContext: 'while_on_board',
                actions: [
                  {
                    type: 'change_stats',
                    params: {
                      mode: 'give',
                      stackable: true,
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]]
                      },
                      speed: {
                        amount: { type: 'fixed', params: { value: 1 } }
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    })
  ]
});
