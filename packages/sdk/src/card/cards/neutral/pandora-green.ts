import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';

export const neutralPandoraGreen = defineSerializedBlueprint({
  id: 'neutral_pandora_green',
  spriteId: 'neutral_pandora_celerity',
  name: 'Envy',
  collectable: false,
  keywords: [KEYWORDS.RANGED.id],
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
      text: '@Ranged@',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'ranged',
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
