import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2CelestialPhantom = defineSerializedBlueprint({
  id: 'f2_celestial_phantom',
  name: 'Celestial Phantom',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  spriteId: 'f2_celestial_phantom',
  cost: 2,
  attack: 1,
  maxHp: 3,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: 'When this deals damage to a unit, destroy that unit.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_after_unit_deal_damage',
            params: {
              target: { candidates: [[{ type: 'is_minion', params: { not: false } }]] },
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: {
                type: 'always'
              }
            }
          }
        ],
        actions: [
          {
            type: 'destroy_unit',
            params: {
              targets: {
                candidates: [[{ type: 'attack_target', params: { not: false } }]]
              },
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
