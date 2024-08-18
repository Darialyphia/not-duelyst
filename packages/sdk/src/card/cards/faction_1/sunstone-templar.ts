import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f1SunstoneTemplar = defineSerializedBlueprint({
  id: 'f1_sunstone_templar',
  name: 'Sunstone Templar',
  spriteId: 'f1_sunstone_templar',
  collectable: true,
  keywords: [KEYWORDS.DISPEL.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  faction: FACTION_IDS.F1,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 1,
  maxHp: 4,
  effects: [
    {
      text: 'When this deals damage to a minion, @Dispel@ that unit.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'dispel_entity',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              unit: {
                candidates: [[{ type: 'attack_target', params: { not: false } }]],
                random: false
              }
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_deal_damage',
            params: {
              target: { candidates: [], random: false },
              unit: {
                candidates: [[{ type: 'is_self', params: { not: false } }]],
                random: false
              },
              frequency: { type: 'always' }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
