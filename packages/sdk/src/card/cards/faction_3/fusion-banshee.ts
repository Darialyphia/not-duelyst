import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f3FusionBanshee = defineSerializedBlueprint({
  id: 'f3_fusion_banshee',
  name: 'Fusion Banshee',
  spriteId: 'f3_fusion_banshee',
  collectable: true,
  keywords: [KEYWORDS.RUSH.id, KEYWORDS.BLAST.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  faction: FACTION_IDS.F3,
  cost: 6,
  attack: 5,
  maxHp: 1,
  effects: [
    {
      text: '@Rush@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'rush',
            params: { execute: 'now', filter: { candidates: [], random: false } }
          }
        ]
      }
    },
    {
      text: '@Blast@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'blast',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      }
    },
    {
      text: 'Cannot attack generals.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'change_can_attack',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false },
              unit: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              target: {
                candidates: [[{ type: 'is_general', params: { not: false } }]],
                random: false
              },
              duration: 'always'
            }
          }
        ]
      }
    }
  ]
});
