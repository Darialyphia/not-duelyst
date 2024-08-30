import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2Rythmweaver = defineSerializedBlueprint({
  id: 'f2_rythmweaver',
  name: 'Rythmweaver',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  spriteId: 'f2_rythmweaver',
  cost: 1,
  attack: 2,
  maxHp: 1,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'After this takes damage, draw a spell',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: { candidates: [[{ type: 'is_self', params: {} }]] },
              unit: { candidates: [] },
              frequency: {
                type: 'always'
              }
            }
          }
        ],
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 1 } },
              player: { candidates: [[{ type: 'ally_player' }]] },
              filter: { candidates: [] },
              execute: 'now',
              kind: CARD_KINDS.SPELL
            }
          }
        ]
      }
    }
  ]
});
