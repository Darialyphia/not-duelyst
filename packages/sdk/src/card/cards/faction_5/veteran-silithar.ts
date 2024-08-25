import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5VeteranSilithar = defineSerializedBlueprint({
  id: 'f5_veteran_silithar',
  collectable: true,
  keywords: ['rebirth'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'rare',
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
  name: 'Veteran Silithar',
  spriteId: 'f5_silithar_veteran',
  cost: 4,
  attack: 4,
  maxHp: 5,
  faction: 'f5'
});
