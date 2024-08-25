import { defineSerializedBlueprint } from '../../card-blueprint';

export const f3AurorasTears = defineSerializedBlueprint({
  id: 'f3_auroras_tears',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'SPELL',
  rarity: 'epic',
  targets: { min: 0, targets: [[[{ type: 'any_cell' }]]] },
  cellHighlights: [],
  spriteId: 'icon_f3_aurorastear',
  name: "Aurora's Tears",
  cost: 2,
  faction: 'f3',
  effects: [
    {
      text: 'Gain 2 gold for each artifact equipped to your general, then destroy them.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'give_gold',
            params: {
              amount: {
                type: 'equiped_artifact_count',
                params: { player: { candidates: [[{ type: 'ally_player' }]] } }
              },
              player: { candidates: [[{ type: 'ally_player' }]] },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          },
          {
            type: 'unequip_artifact',
            params: {
              artifact: {
                candidates: [[{ type: 'equiped_by_ally', params: {} }]],
                random: false
              },
              execute: 'now',
              filter: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
