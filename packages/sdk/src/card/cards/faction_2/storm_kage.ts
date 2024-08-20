import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { f2KageLightning } from './kage_lightning';

export const f2StormKage = defineSerializedBlueprint({
  id: 'f2_storm_kage',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [f2KageLightning.id],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  targets: { min: 0, targets: [] },
  spriteId: 'f2_storm_kage',
  name: 'Storm Kage',
  cost: 7,
  attack: 6,
  maxHp: 10,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'When an allied unit or spell deals damage to an enemy unit, put a @Kage Lightning@ into your hand until the end of the turn (max. 3 times per turn).',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'generate_card',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              ephemeral: true,
              location: 'hand',
              player: { candidates: [[{ type: 'ally_player' }]] },
              blueprint: ['f2_kage_lightning']
            }
          }
        ],
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: [[{ type: 'is_enemy', params: {} }]],
              unit: { candidates: [] },
              frequency: { type: 'n_per_turn', params: { count: 3 } }
            }
          }
        ]
      }
    }
  ]
});
