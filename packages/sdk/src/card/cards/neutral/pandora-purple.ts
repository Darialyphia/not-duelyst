import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPandoraPurple = defineSerializedBlueprint({
  id: 'neutral_pandora_purple',
  spriteId: 'neutral_pandora_provoke',
  name: 'Fear',
  collectable: false,
  keywords: [KEYWORDS.PROVOKE.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: 'MINION',
  rarity: 'token',
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 2,
  attack: 3,
  maxHp: 3,
  faction: null,
  effects: [
    {
      text: '@Provoke@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'provoke',
            params: {
              filter: { candidates: [], random: false },
              execute: 'now',
              activeWhen: { candidates: [], random: false }
            }
          }
        ]
      },
      vfx: { tracks: [] }
    }
  ]
});
