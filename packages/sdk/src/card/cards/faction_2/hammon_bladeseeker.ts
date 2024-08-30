import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { allyGeneral } from '../../helpers/targeting';

export const f2HammonBladeseeker = defineSerializedBlueprint({
  id: 'f2_hammon_bladeseeker',
  name: 'Hammon Bladeseeker',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  spriteId: 'f2_hammon_bladeseeker',
  cost: 5,
  attack: 8,
  maxHp: 8,
  faction: FACTION_IDS.F2,
  effects: [
    defineCardEffect({
      text: 'At the start of your turn, deal 2 damage to your general.',
      config: {
        executionContext: 'trigger_while_on_board',
        triggers: [
          {
            type: 'on_player_turn_start',
            params: {
              player: { candidates: [[{ type: 'ally_player' }]] },
              frequency: { type: 'always' }
            }
          }
        ],
        actions: [
          {
            type: 'deal_damage',
            params: {
              amount: { type: 'fixed', params: { value: 2 } },
              targets: allyGeneral(),
              filter: { candidates: [] },
              execute: 'now'
            }
          }
        ]
      }
    })
  ]
});
