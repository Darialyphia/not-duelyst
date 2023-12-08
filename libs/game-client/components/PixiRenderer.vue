<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { tileSpritesPaths } from '../assets/tiles';
import { Polygon } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';

const { state, mapRotation } = useGame();

const app = useApplication();

const cellHitArea = new Polygon([
  { x: CELL_SIZE / 2, y: 0 },
  { x: CELL_SIZE, y: CELL_SIZE / 4 },
  { x: CELL_SIZE, y: CELL_SIZE * 0.75 },
  { x: CELL_SIZE / 2, y: CELL_SIZE },
  { x: 0, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE / 4 }
]);

const screenViewport = shallowRef<Viewport>();

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso(
      { x: state.value.map.width / 2, y: state.value.map.height / 2, z: 0 },
      mapRotation.value,
      state.value.map
    );
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
      <IsoPositioner
        v-for="cell in state.map.cells"
        :key="cell.id"
        :x="cell.position.x"
        :y="cell.position.y"
        :z="cell.position.z"
      >
        <sprite :texture="tileSpritesPaths[cell.tile.id]" :anchor-x="0.5" />
      </IsoPositioner>
    </container>
  </viewport>
</template>
