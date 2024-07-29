import { defineSerializedBlueprint } from '../../card-blueprint';

export const f1IroncliffeGuardian = defineSerializedBlueprint({
  id: 'ironcliffe_guardian',
  collectable: true,
  name: 'Ironcliffe Guardian',
  cost: 5,
  attack: 3,
  maxHp: 10,
  faction: 'f1',
  keywords: ['provoke', 'airdrop'],
  kind: 'MINION',
  rarity: 'rare',
  relatedBlueprintIds: [],
  spriteId: 'f1_ironcliffe_guardian',
  tags: [],
  effects: [
    {
      text: '@Provoke@.',
      config: {
        executionContext: 'immediate',
        actions: [
          { type: 'provoke', params: { filter: [], activeWhen: [], execute: 'now' } }
        ]
      }
    },
    {
      text: '@Airdrop@.',
      config: { executionContext: 'on_init', actions: [{ type: 'airdrop' }] }
    }
  ],
  targets: { min: 0, targets: [] }
});
