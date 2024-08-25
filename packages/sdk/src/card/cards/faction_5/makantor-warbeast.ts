import { defineSerializedBlueprint } from '../../card-blueprint';

export const f5MakantorWarbeast = defineSerializedBlueprint({
  id: 'f5_makantor_warbeast',
  collectable: true,
  keywords: ['rush', 'frenzy'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'epic',
  effects: [
    {
      text: '@Rush@.',
      config: { actions: [], executionContext: 'while_on_board' },
      vfx: { tracks: [] }
    },
    {
      text: '@Frenzy@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'frenzy',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false },
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
  spriteId: 'f5_mankator_warbeast',
  name: 'Makantor Warbeast',
  cost: 6,
  attack: 4,
  maxHp: 4,
  faction: 'f5'
});
