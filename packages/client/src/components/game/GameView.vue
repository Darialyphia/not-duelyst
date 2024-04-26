<script setup lang="ts">
import { diffuseGroup, normalGroup, lightGroup, PointLight } from '@pixi/lights';

// watchEffect(() => {
//   if (gameObjectsLayer.value) {
//     gameObjectsLayer.value.group.enableSort = true;
//     gameObjectsLayer.value.sortableChildren = true;
//   }
// });
const { ui } = useGame();

const cells = useGameSelector(session => session.boardSystem.cells);
const entities = useGameSelector(session => session.entitySystem.getList());
const isDev = import.meta.env.DEV;
</script>

<template>
  <!-- <Sky /> -->
  <Layer :group="diffuseGroup" />
  <Layer :group="normalGroup" />
  <Layer :group="lightGroup" />
  <Camera>
    <AmbientLight
      :color="ui.ambientLightColor.value"
      :brightness="ui.ambientLightStrength.value"
    />

    <!-- <Underground /> -->
    <MapCell v-for="cell in cells" :key="cell.id" :cell-id="cell.id" />

    <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
    <SummonPreview />
    <PointLight
      v-if="ui.mouseLightStrength.value > 0"
      :brightness="ui.mouseLightStrength.value"
      :color="ui.mouseLightColor.value"
      :position="ui.mousePosition.value"
    />
  </Camera>

  <Tint />
  <TargetingOverlay />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />

  <Fps v-if="isDev" />
</template>
