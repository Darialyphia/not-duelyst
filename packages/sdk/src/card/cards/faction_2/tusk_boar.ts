import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2TuskBoar = defineSerializedBlueprint({
  id: 'f2_tusk_boar',
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
        executionContext: 'immediate',
        actions: [
          {
            type: 'rush',
            params: {}
          }
        ]
      }
    },
    {
      text: 'At the start of your turn, return this to your hand.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_player_turn_start',
            params: {
              player: {
                candidates: [
                  [
                    {
                      type: 'ally_player',
                      params: {}
                    }
                  ]
                ]
              },
              frequency: []
            }
          }
        ],
        actions: [
          {
            type: 'bounce_unit',
            params: {
              targets: {
                candidates: [
                  [
                    {
                      type: 'is_self',
                      params: { not: false }
                    }
                  ]
                ]
              },
              filter: { candidates: [] }
            }
          }
        ]
      }
    }
  ]
});
