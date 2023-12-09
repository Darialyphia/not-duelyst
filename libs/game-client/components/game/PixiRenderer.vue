<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { Polygon } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';

const { state, mapRotation } = useGame();
const app = useApplication();

const screenViewport = shallowRef<Viewport>();

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso({ x: 0, y: 0, z: 0 }, mapRotation.value, {
      width: 0,
      height: 0
    });
    screenViewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .wheel({ smooth: 3, percent: 0.05 })
      .zoomPercent(1, false)
      .moveCenter(center.isoX, center.isoY);
  });
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="state.map.width * CELL_SIZE"
    :world-height="state.map.height * CELL_SIZE"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
  >
    <container :sortable-children="true">
      <MapCell v-for="cell in state.map.cells" :key="cell.id" :cell="cell" />

      <Unit v-for="entity in state.entities" :key="entity.id" :entity="entity" />
    </container>
  </viewport>
</template>
