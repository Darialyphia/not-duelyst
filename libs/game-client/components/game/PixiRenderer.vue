<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { Polygon } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';
import placeholderSprite from '../assets/sprites/placeholder.png';

const { state, mapRotation, assets } = useGame();
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

      <IsoPositioner
        v-for="entity in state.entities"
        :key="entity.id"
        :x="entity.position.x"
        :y="entity.position.y"
        :z="entity.position.z + 0.1"
      >
        <sprite :texture="placeholderSprite" :anchor-x="0.5" :y="-CELL_SIZE / 2" />
      </IsoPositioner>
    </container>
  </viewport>
</template>
