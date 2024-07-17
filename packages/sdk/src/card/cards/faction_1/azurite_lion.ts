import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';

export const f1AzuriteLion = defineSerializedBlueprint({
  id: 'azurite_lion',
  collectable: true,
  name: 'Azurite Lion',
  cost: 2,
  attack: 2,
  maxHp: 3,
  faction: FACTION_IDS.F1,
  keywords: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'f1_azurite_lion',
  tags: [],
  effects: [
    defineCardEffect({
      text: '@Celerity@.',
      config: {
        executionContext: 'immediate',
        actions: [{ type: 'celerity', params: {} }]
      }
    })
  ]
});
