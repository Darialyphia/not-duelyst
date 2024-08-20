import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPandoraYellow = defineSerializedBlueprint({
  id: 'neutral_pandora_yellow',
  spriteId: 'neutral_pandora_rush',
  name: 'Rage',
  collectable: false,
  keywords: [KEYWORDS.FRENZY.id],
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
      text: '@Frenzy@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'frenzy',
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
