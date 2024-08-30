import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { enemyMinion, manualTarget } from '../../helpers/targeting';

export const f1TrueStrike = defineSerializedBlueprint({
  id: 'f1_true_strike',
  collectable: true,
  name: 'True Strike',
  cost: 1,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_truestrike',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: enemyMinion() }
          }
        ]
      ]
    ]
  },
  effects: [
    {
      text: 'Deal 2 damage to an enemy minion.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'deal_damage',
            params: {
              targets: manualTarget(0),
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
                type: 'playSfxOnEntity',
                params: {
                  duration: 1360,
                  resourceName: 'fx_f1_truestrike',
                  animationName: 'default',
                  offset: { x: 0, y: -60 },
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  }
                }
              },
              {
                type: 'playSfxOnEntity',
                params: {
                  duration: 480,
                  resourceName: 'fx_energyhaloground',
                  animationName: 'default',
                  offset: { x: 0, y: 60 },
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  }
                }
              }
            ]
          },
          {
            filter: { candidates: [] },
            steps: [
              { type: 'wait', params: { duration: 750 } },
              {
                type: 'addLightOnEntity',
                params: {
                  duration: 400,
                  alpha: 0.3,
                  blendMode: 1,
                  color: 16763904,
                  entity: {
                    candidates: [
                      [{ type: 'is_manual_target', params: { not: false, index: 0 } }]
                    ]
                  },
                  offset: { x: 0, y: -30 },
                  radius: 100
                }
              }
            ]
          }
        ]
      }
    }
  ]
});
