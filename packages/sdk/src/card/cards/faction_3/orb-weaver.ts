import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const f3OrbWeaver = defineSerializedBlueprint({
  id: 'f3_orb_weaver',
  name: 'Orb Weaver',
  spriteId: 'f3_orb_weaver',
  collectable: true,
  keywords: [KEYWORDS.OPENING_GAMBIT.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 2,
  faction: 'f3',
  effects: [
    defineCardEffect({
      text: '@Opening Gambit@:  Summon a copy of this unit on a nearby space.',
      config: {
        actions: [
          {
            type: 'summon_unit',
            params: {
              filter: {
                candidates: [[{ type: 'played_from_hand', params: {} }]],
                random: false
              },
              execute: 'now',
              blueprint: ['f3_orb_weaver'],
              player: { candidates: [[{ type: 'ally_player' }]], random: false },
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]],
                random: false
              }
            }
          }
        ],
        executionContext: 'immediate'
      }
    })
  ],
  targets: {
    min: 0,
    targets: [
      [
        [
          { type: 'is_empty' },
          {
            type: 'is_nearby',
            params: {
              unit: { candidates: [], random: false },
              cell: {
                candidates: [[{ type: 'summon_target' }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  }
});
