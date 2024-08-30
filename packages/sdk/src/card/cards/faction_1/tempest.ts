import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f1Tempest = defineSerializedBlueprint({
  id: 'f1_tempest',
  collectable: true,
  name: 'Tempest',
  cost: 2,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_tempest',
  tags: [],
  targets: {
    min: 1,
    targets: [[[{ type: 'any_cell' }]]]
  },
  cellHighlights: [
    [
      {
        type: 'has_unit',
        params: { unit: { candidates: [[{ type: 'any_unit' }]] } }
      }
    ]
  ],
  effects: [
    {
      text: 'Deal 2 damage to all units.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              targets: { candidates: [[{ type: 'any_unit' }]] },
              amount: { type: 'fixed', params: { value: 2 } }
            }
          }
        ]
      },
      vfx: {
        tracks: [
          {
            filter: { candidates: [] },
            steps: [
              {
                params: { amplitude: 8, duration: 500, isBidirectional: true },
                type: 'shakeScreen'
              },
              {
                params: {
                  animationName: 'default',
                  duration: 880,
                  entity: { candidates: [[{ type: 'any_unit' }]] },
                  offset: { x: 0, y: -175 },
                  resourceName: 'fx_heavenlystrike'
                },
                type: 'playSfxOnEntity'
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              {
                params: {
                  alpha: 0.25,
                  blendMode: 1,
                  color: 12292864,
                  duration: 1541,
                  entity: {
                    candidates: [
                      [
                        { params: { not: false }, type: 'is_general' },
                        { params: { not: false }, type: 'is_ally' }
                      ]
                    ]
                  },
                  offset: { x: 0, y: -250 },
                  radius: 500
                },
                type: 'addLightOnEntity'
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              { params: { duration: 500 }, type: 'wait' },
              {
                params: {
                  animationName: 'default',
                  duration: 1040,
                  entity: { candidates: [[{ type: 'any_unit' }]] },
                  offset: { x: 0, y: 0 },
                  resourceName: 'fx_fireslash'
                },
                type: 'playSfxOnEntity'
              }
            ]
          }
        ]
      }
    }
  ]
});
