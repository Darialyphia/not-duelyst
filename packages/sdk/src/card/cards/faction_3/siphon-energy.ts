import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3SiphonEnergy = defineSerializedBlueprint({
  id: 'f3_siphon_energy',
  cellHighlights: [],
  name: 'Siphon Energy',
  spriteId: 'icon_f3_syphon_energy',
  cost: 0,
  faction: 'f3',
  collectable: true,
  keywords: [KEYWORDS.DISPEL.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: '@Dispel@ a minion.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'dispel_entity',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: {
              unit: {
                candidates: [[{ type: 'is_minion', params: { not: false } }]],
                random: false
              }
            }
          }
        ]
      ]
    ]
  }
});
