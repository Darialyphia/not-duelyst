import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';

export const f4SpectralRevenant = defineSerializedBlueprint({
  id: 'f4_spectral_revenant',
  collectable: true,
  keywords: ['rush', 'slay'],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'legendary',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  spriteId: 'f4_spectral_revenant',
  name: 'Spectral Revenant',
  cost: 7,
  attack: 6,
  maxHp: 6,
  faction: 'f4',
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
    defineCardEffect({
      text: '@Slay@: Deal 3 damage to the enemy general.',
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
                    type: 'deal_damage',
                    params: {
                      amount: { type: 'fixed', params: { value: 3 } },
                      targets: {
                        candidates: [
                          [
                            { type: 'is_enemy', params: { not: false } },
                            { type: 'is_general', params: { not: false } }
                          ]
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    })
  ]
});
