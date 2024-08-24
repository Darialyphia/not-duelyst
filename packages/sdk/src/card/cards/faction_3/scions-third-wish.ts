import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3ScionsThirdWish = defineSerializedBlueprint({
  id: 'f3_scions_third_wish',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  kind: CARD_KINDS.SPELL,
  tags: [],
  rarity: RARITIES.EPIC,
  targets: { min: 1, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  name: "Scion's Third Wish",
  spriteId: 'icon_f3_scions_third_wish',
  cost: 3,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: 'This turn, give your general +3/+0, and "this can move up to 3 spaces. Reduce damage this takes by 3.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              duration: 'end_of_turn',
              execute: 'now'
            }
          },
          {
            type: 'change_stats',
            params: {
              mode: 'set',
              stackable: false,
              speed: {
                amount: { type: 'fixed', params: { value: 3 } },
                activeWhen: { candidates: [] }
              },
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              duration: 'end_of_turn',
              execute: 'now'
            }
          },
          {
            type: 'change_damage_taken',
            params: {
              mode: 'give',
              stackable: true,
              targets: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ]
              },
              filter: { candidates: [] },
              frequency: { type: 'always' },
              amount: { type: 'fixed', params: { value: -3 } },
              duration: 'end_of_turn',
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
