<script setup lang="ts">
import { diffuseGroup, normalGroup, lightGroup, PointLight } from '@pixi/lights';

const { ui } = useGame();

useGameControls();
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

    <MapCell v-for="cell in cells" :key="cell.id" :cell-id="cell.id" />
    <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
    <SummonPreview />
    <PointLight
      v-if="ui.mouseLightStrength.value > 0"
      :brightness="ui.mouseLightStrength.value"
      :color="ui.mouseLightColor.value"
      :position="{ x: ui.mousePosition.value.x, y: ui.mousePosition.value.y - 50 }"
    />
  </Camera>

  <!-- <Tint /> -->

  <TargetingOverlay />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />

  <Fps v-if="isDev" />
</template>
