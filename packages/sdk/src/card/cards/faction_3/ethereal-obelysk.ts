import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const f3EtherealObelysk = defineSerializedBlueprint({
  id: 'f3_ethereal_obelysk',
  spriteId: 'f3_ethereal_obelysk',
  name: 'Ethereal Obelysk',
  collectable: true,
  keywords: [KEYWORDS.SPAWN.id, KEYWORDS.STRUCTURE.id],
  relatedBlueprintIds: ['f3_wind_dervish'],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  cellHighlights: [],
  cost: 2,
  attack: 0,
  maxHp: 6,
  faction: 'f3',
  effects: [
    { text: '@Structure@.', config: { executionContext: 'while_on_board', actions: [] } },
    {
      text: '@Spawn@: @Wind Dervish@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'spawn',
            params: {
              blueprint: ['f3_wind_dervish'],
              position: {
                candidates: [[{ type: 'is_manual_target', params: { index: 0 } }]]
              },
              filter: { candidates: [] },
              execute: 'now',
              activeWhen: { candidates: [] }
            }
          }
        ]
      }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'is_nearby',
            params: {
              unit: { candidates: [] },
              cell: { candidates: [[{ type: 'summon_target' }]] }
            }
          }
        ]
      ]
    ]
  }
});
