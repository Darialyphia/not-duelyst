import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2LanternFox = defineSerializedBlueprint({
  id: 'f2_lantern_fox',
  collectable: true,
  name: 'Lantern Fox',
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  spriteId: 'f2_lantern_fox',
  cost: 3,
  attack: 2,
  maxHp: 4,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'When this takes damage, add a @Phoenix Fire@ to your hand.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: [
                [
                  {
                    type: 'is_self',
                    params: {}
                  }
                ]
              ],
              unit: { candidates: [] },
              frequency: {
                type: 'always'
              }
            }
          }
        ],
        actions: [
          {
            type: 'generate_card',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              ephemeral: false,
              location: 'hand',
              player: {
                candidates: [
                  [
                    {
                      type: 'ally_player'
                    }
                  ]
                ]
              },
              blueprint: ['f2_phoenix_fire']
            }
          }
        ]
      }
    }
  ]
});
