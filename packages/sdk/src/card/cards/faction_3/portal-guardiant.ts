import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, RARITIES } from '../../card-enums';

export const f3PortalGuardian = defineSerializedBlueprint({
  id: 'f3_portal_guardian',
  name: 'Portal Guardian',
  spriteId: 'f3_portal_guardian',
  collectable: true,
  keywords: [KEYWORDS.FRENZY.id],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  targets: { min: 0, targets: [] },
  cellHighlights: [],
  cost: 3,
  attack: 1,
  maxHp: 7,
  faction: 'f3',
  effects: [
    {
      text: '@Frenzy@.',
      config: {
        executionContext: 'while_on_board',
        actions: [
          {
            type: 'frenzy',
            params: {
              filter: { candidates: [] },
              execute: 'now',
              activeWhen: { candidates: [] }
            }
          }
        ]
      }
    },
    {
      text: 'When you summon a minion, this gans +1/+0.',
      config: {
        executionContext: 'trigger_while_on_board',
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: { type: 'fixed', params: { value: 1 } },
                activeWhen: { candidates: [] }
              },
              targets: { candidates: [[{ type: 'is_self', params: { not: false } }]] },
              filter: { candidates: [] },
              duration: 'always',
              execute: 'now'
            }
          }
        ],
        triggers: [
          {
            type: 'on_unit_play',
            params: {
              unit: { candidates: [[{ type: 'is_ally', params: { not: false } }]] },
              frequency: { type: 'always' }
            }
          }
        ]
      }
    }
  ]
});
