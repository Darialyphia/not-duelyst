import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3WindShrike = defineSerializedBlueprint({
  id: 'f3_wind_shrike',
  name: 'Wind Shrike',
  spriteId: 'f3_wind_shrike',
  collectable: true,
  keywords: [KEYWORDS.DYING_WISH.id, KEYWORDS.FLYING.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 4,
  attack: 4,
  maxHp: 3,
  faction: FACTION_IDS.F3,
  effects: [
    {
      text: '@Flying@.',
      config: {
        actions: [
          {
            type: 'flying',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              activeWhen: { candidates: [] }
            }
          }
        ],
        executionContext: 'while_on_board'
      }
    },
    {
      text: "@Dying Wish@: Equipe a @Staff of Y'kir@ to your General.",
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'equip_artifact',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              blueprint: ['f3_staff_of_ykir'],
              player: { candidates: [[{ type: 'ally_player' }]] }
            }
          }
        ],
        triggers: [
          {
            type: 'on_before_unit_destroyed',
            params: {
              unit: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
