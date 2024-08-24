import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { allyGeneral } from '../../helpers/targeting';
import { whileArtifactEquipedEffect } from '../../helpers/while-artifact-equiped.effect';

export const f1SunstoneBracers = defineSerializedBlueprint({
  id: 'f1_sunstone_bracers',
  collectable: true,
  name: 'Sunstone Bracers',
  cost: 0,
  kind: 'ARTIFACT',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.BASIC,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_artifact_sunstonebracers',
  tags: [],
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: allyGeneral() }
          }
        ]
      ]
    ]
  },
  effects: [
    whileArtifactEquipedEffect({
      text: 'Your general has +1/+0.',
      actions: [
        {
          type: 'change_stats',
          params: {
            targets: allyGeneral(),
            mode: 'give',
            attack: { amount: { type: 'fixed', params: { value: 1 } } },
            stackable: true
          }
        }
      ]
    })
  ]
});
