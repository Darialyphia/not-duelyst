import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { airdropEffect } from '../../helpers/airdrop.effect';

export const f1LysianBrawler = defineSerializedBlueprint({
  id: 'f1_lysian_brawler',
  collectable: true,
  name: 'Lysian Brawler',
  cost: 4,
  attack: 4,
  maxHp: 4,
  faction: FACTION_IDS.F1,
  keywords: [KEYWORDS.CELERITY.id],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'f1_lysian_brawler',
  tags: [],
  effects: [
    airdropEffect(),
    defineCardEffect({
      text: '@Celerity@.',
      config: {
        executionContext: 'immediate',
        actions: [{ type: 'celerity', params: {} }]
      }
    })
  ]
});
