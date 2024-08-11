import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralVenomToth = defineSerializedBlueprint({
  id: 'neutral_venom_toth',
  name: 'Venom Toth',
  spriteId: 'neutral_venom_toth',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: 'When your opponent summons a minion, deal 1 damage to the enemy general.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              targets: {
                candidates: [
                  [
                    { type: 'is_enemy', params: { not: false } },
                    { type: 'is_general', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: { candidates: [[{ type: 'is_enemy', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
