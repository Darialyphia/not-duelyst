import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const neutralTombstone = defineSerializedBlueprint({
  spriteId: 'neutral_tombstone',
  name: 'Tombstone',
  id: 'neutral_tombstone',
  collectable: false,
  keywords: [KEYWORDS.PROVOKE.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 0,
  maxHp: 10,
  faction: null,
  effects: [
    {
      text: '@Provoke@.',
      config: {
        executionContext: 'while_on_board',
        actions: [{ type: 'provoke', params: { execute: 'now' } }]
      }
    }
  ]
});
