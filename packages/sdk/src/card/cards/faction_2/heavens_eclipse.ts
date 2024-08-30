import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f2HeavensEclipse = defineSerializedBlueprint({
  id: 'f2_heavens_eclipse',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  spriteId: 'icon_f2_heavens_eclipse',
  name: "Heaven's Eclipse",
  cost: 4,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [[[{ type: 'any_cell' }]]]
  },
  effects: [
    {
      text: 'Draw 3 spells.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: { type: 'fixed', params: { value: 3 } },
              player: { candidates: [[{ type: 'ally_player' }]] },
              filter: { candidates: [] },
              execute: 'now',
              kind: 'SPELL'
            }
          }
        ]
      }
    }
  ]
});
