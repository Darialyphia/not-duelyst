import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3StarsFury = defineSerializedBlueprint({
  id: 'f3_stars_fury',
  spriteId: 'icon_f3_stars_fury',
  name: "Star's Fury",
  collectable: true,
  keywords: [],
  relatedBlueprintIds: ['f3_wind_dervish'],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [
    [
      {
        type: 'is_in_front',
        params: { unit: { candidates: [[{ type: 'is_enemy', params: { not: false } }]] } }
      },
      { type: 'is_empty' }
    ]
  ],
  cost: 5,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'Summon a @Wind Dervish@ on the space if front of each enemy',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              blueprint: ['f3_wind_dervish'],
              player: { candidates: [[{ type: 'ally_player' }]] },
              position: {
                candidates: [
                  [
                    {
                      type: 'is_in_front',
                      params: {
                        unit: {
                          candidates: [[{ type: 'is_enemy', params: { not: false } }]]
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      }
    }
  ]
});
