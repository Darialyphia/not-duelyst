import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { nTimesPerTurn } from '../../helpers/fequency';
import { allyGeneral } from '../../helpers/targeting';
import { whileArtifactEquipedEffect } from '../../helpers/while-artifact-equiped.effect';

export const f1ArclyteRegalia = defineSerializedBlueprint({
  id: 'f1_arclyte_regalia',
  collectable: true,
  name: 'Arclyte Regalia',
  cost: 4,
  kind: 'ARTIFACT',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.LEGENDARY,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_artifact_arclyte_regalia',
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
      text: 'Your general has +2/+0.',
      actions: [
        {
          type: 'change_stats',
          params: {
            targets: allyGeneral(),
            mode: 'give',
            attack: { amount: { type: 'fixed', params: { value: 2 } } },
            stackable: true
          }
        }
      ]
    }),
    whileArtifactEquipedEffect({
      text: 'The first time your General takes damage with this equipped each turn, reduce that damage by 2.',
      actions: [
        {
          type: 'change_damage_taken',
          params: {
            mode: 'give',
            stackable: true,
            targets: allyGeneral(),
            frequency: nTimesPerTurn(1),
            amount: { type: 'fixed', params: { value: -2 } }
          }
        }
      ]
    })
  ]
});
