import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPandoraRed = defineSerializedBlueprint({
  id: 'neutral_pandora_red',
  spriteId: 'neutral_pandora_frenzy',
  name: 'Wrath',
  collectable: false,
  keywords: [KEYWORDS.CELERITY.id],
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
      text: '@Celerity@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'celerity',
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
