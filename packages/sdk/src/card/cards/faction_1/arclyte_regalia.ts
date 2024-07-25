import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';
import { nTimesPerTurn } from '../../helpers/fequency';
import { allyGeneral, cellWithAllyGeneral } from '../../helpers/targeting';
import { whileArtifactEquipedEffect } from '../../helpers/while-artifact-equiped.effect';

export const f1ArclyteRegalia = defineSerializedBlueprint({
  id: 'arclyte_regalia',
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
    targets: [cellWithAllyGeneral()]
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
            attack: { amount: fixedAmount(2) },
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
            filter: [],
            frequency: nTimesPerTurn(1),
            amount: fixedAmount(-2)
          }
        }
      ]
    })
  ]
});
