import { defineSerializedBlueprint } from '../../card-blueprint';

export const f4SpectralRevenant = defineSerializedBlueprint({
  id: 'f4_spectral_revenant',
  collectable: true,
  keywords: ['rush', 'slay'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  effects: [
    {
      text: '@Rush@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'rush',
            params: { execute: 'now', filter: { candidates: [], random: false } }
          }
        ]
      },
      vfx: { tracks: [] }
    },
    {
      text: '@Slay@: Reactivate this unit.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'slay',
            params: {
              execute: 'now',
              filter: { candidates: [], random: false },
              duration: 'always',
              activeWhen: { candidates: [], random: false },
              effect: {
                executionContext: 'immediate',
                actions: [
                  {
                    type: 'activate_unit',
                    params: {
                      filter: { candidates: [], random: false },
                      targets: {
                        candidates: [[{ type: 'is_self', params: { not: false } }]],
                        random: false
                      },
                      execute: 'now'
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ],
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_spectral_revenant',
  name: 'Spectral Revenant',
  cost: 7,
  attack: 6,
  maxHp: 6,
  faction: 'f4'
});
