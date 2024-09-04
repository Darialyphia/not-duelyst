import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const f1AegisBarrier = defineSerializedBlueprint({
  id: 'f1_aegis_barrier',
  collectable: true,
  keywords: [KEYWORDS.BARRIER.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'common',
  effects: [
    {
      text: 'Give an allied minion @Barrier@.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'add_effect',
            params: {
              unit: {
                candidates: [
                  [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                ],
                random: false
              },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'barrier',
                    params: {
                      filter: { candidates: [], random: false },
                      execute: 'now',
                      activeWhen: { candidates: [], random: false },
                      duration: 'always'
                    }
                  }
                ]
              },
              linkToCard: false,
              execute: 'now',
              filter: { candidates: [], random: false }
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
                candidates: [
                  [
                    { type: 'is_ally', params: { not: false } },
                    { type: 'is_minion', params: { not: false } }
                  ]
                ],
                random: false
              }
            }
          }
        ]
      ]
    ]
  },
  cellHighlights: [],
  spriteId: 'icon_f1_aegisbarrier',
  name: 'Aegis Barrier',
  cost: 1,
  faction: 'f1'
});
