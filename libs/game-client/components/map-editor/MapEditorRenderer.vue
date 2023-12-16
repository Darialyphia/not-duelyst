<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import type { Viewport } from 'pixi-viewport';
import type { Cell, Point3D } from '@hc/sdk';

const { assets, rotation } = defineProps<{
  assets: AssetsContext;
  rotation: 0 | 90 | 180 | 270;
}>();

const emit = defineEmits<{
  cellClick: [cell: Cell];
}>();
const map = defineModel<{
  width: number;
  height: number;
  cells: Cell[];
  startPositions: [Point3D, Point3D];
}>('map', { required: true });

provide(ASSETS_INJECTION_KEY, assets);

const app = useApplication();

const screenViewport = shallowRef<Viewport>();

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso({ x: 0, y: 0, z: 0 }, rotation, {
      width: 0,
      height: 0
    });

    screenViewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      .clampZoom({ minScale: 1, maxScale: 4 })
      .zoomPercent(1, false)
      .moveCenter(center.isoX, center.isoY);
  });

const onCellClick = (cell: Cell) => {
  emit('cellClick', cell);
};
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="map.width * CELL_SIZE"
    :world-height="map.height * CELL_SIZE"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <EditorCell
      v-for="cell in map.cells"
      :key="cell.id"
      :cell="cell"
      :map="map"
      :rotation="rotation"
      @click="onCellClick(cell)"
    />
  </viewport>
</template>
