import type { SerializedBlueprint } from '../../card-blueprint';

export const neutralHealingMystic: SerializedBlueprint = {
  id: 'healing_mystic',
  collectable: true,
  name: 'Healing Mystic',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: null,
  keywords: [],
  kind: 'MINION',
  rarity: 'common',
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'neutral_healing_mystic',
  tags: [],
  followup: undefined, // haven't handled followup as data yet,
  effects: [
    {
      text: 'Opening Gambit: Heal another unit for 2',
      config: {
        trigger: {
          type: 'on_unit_play',
          params: {
            filter: [],
            unit: [{ type: 'is_self' }]
          }
        },
        actions: [
          {
            type: 'heal',
            params: {
              targets: [
                {
                  type: 'is_followup',
                  params: { index: 0 }
                }
              ],
              amount: {
                type: 'fixed',
                params: { value: 2 }
              }
            }
          }
        ]
      }
    }
  ]
};
