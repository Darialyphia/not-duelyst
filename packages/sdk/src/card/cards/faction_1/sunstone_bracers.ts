import { defineSerializedBlueprint } from '../../card-blueprint';
import { cellWithAllyGeneral } from '../../helpers/targeting';

export const f1SunstoneBracers = defineSerializedBlueprint({
  id: 'sunstone_bracers',
  collectable: true,
  name: 'Sunstone Braces',
  cost: 1,
  kind: 'ARTIFACT',
  faction: null,
  keywords: [],
  rarity: 'common',
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_artifact_sunstonebracers',
  tags: [],
  targets: {
    min: 1,
    targets: [cellWithAllyGeneral()]
  },
  effects: []
});
