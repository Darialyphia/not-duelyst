import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5YoungSilithar = defineSerializedBlueprint({
  id: 'f4_young_silithar',
  collectable: true,
  keywords: ['rebirth'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'common',
  effects: [
    {
      text: '@Rebirth@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'rebirth',
            params: {
              filter: { candidates: [], random: false },
              activeWhen: { candidates: [], random: false },
              execute: 'now',
              duration: 'always'
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f5_young_silithar',
  name: 'Young Silithar',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: 'f5'
});
