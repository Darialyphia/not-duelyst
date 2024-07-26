import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2TuskBoar = defineSerializedBlueprint({
  id: 'HNtZ8Z',
  collectable: true,
  keywords: [KEYWORDS.RUSH.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  spriteId: 'f2_tusk_boar',
  name: 'Tusk Boar',
  cost: 2,
  attack: 3,
  maxHp: 3,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: '@Rush@.',
      config: {
        executionContext: 'on_init',
        actions: [
          {
            type: 'rush'
          }
        ]
      }
    },
    {
      text: 'At the start of your turn, turn this to your hand.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_player_turn_start',
            params: {
              player: [
                [
                  {
                    type: 'ally_player',
                    params: {}
                  }
                ]
              ],
              frequency: []
            }
          }
        ],
        actions: [
          {
            type: 'bounce_unit',
            params: {
              targets: [
                [
                  {
                    type: 'is_self'
                  }
                ]
              ],
              filter: []
            }
          }
        ]
      }
    }
  ]
});
