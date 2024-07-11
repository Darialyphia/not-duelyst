import { KEYWORDS } from '../../../utils/keywords';
import {
  defineSerializedBlueprint,
  type SerializedBlueprint
} from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const neutralHealingMystic = defineSerializedBlueprint({
  id: 'healing_mystic',
  collectable: true,
  name: 'Healing Mystic',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: null,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  kind: 'MINION',
  rarity: 'common',
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'neutral_healing_mystic',
  tags: [],
  followup: undefined, // haven't handled followup as data yet,
  effects: [
    defineCardEffect({
      text: '@Opening Gambit@: Heal another unit for 2',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: [[{ type: 'is_self' }]]
            }
          }
        ],
        actions: [
          {
            type: 'heal',
            params: {
              targets: [
                [
                  {
                    type: 'is_followup',
                    params: { index: 0 }
                  }
                ]
              ],
              amount: {
                type: 'fixed',
                params: { value: 2 }
              }
            }
          }
        ]
      }
    })
  ]
});
