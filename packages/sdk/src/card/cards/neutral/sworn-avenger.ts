import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralSwornAvenger = defineSerializedBlueprint({
  id: 'neutral_sworn_avenger',
  spriteId: 'neutral_sworn_avanger',
  name: 'Sworn Avenger',
  collectable: true,
  keywords: [KEYWORDS.RANGED.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 1,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Ranged@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'ranged',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: 'When your general takes damage, this gains +1/+0.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [], random: false }
              },
              targets: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              filter: { candidates: [], random: false },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: {
                candidates: [
                  [
                    { type: 'is_general', params: { not: false } },
                    { type: 'is_ally', params: { not: false } }
                  ]
                ],
                random: false
              },
              unit: { candidates: [], random: false },
              card: { candidates: [], random: false },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
