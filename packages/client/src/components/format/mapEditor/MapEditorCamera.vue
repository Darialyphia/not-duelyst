<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { CELL_HEIGHT, CELL_WIDTH } from '@/utils/constants';
import { Container } from 'pixi.js';

const app = useApplication();

const { camera, dimensions, layers, tool } = useMapEditor();

const cells = computed(() => layers.value.map(layer => layer.cells).flat());
const isoCells = computed(() =>
  cells.value
    .filter(
      cell =>
        cell.position.x < dimensions.x.value &&
        cell.position.x >= 0 &&
        cell.position.y < dimensions.y.value &&
        cell.position.y >= 0
    )
    .map(cell =>
      toIso(cell.position, camera.angle.value, {
        width: dimensions.x.value,
        height: dimensions.y.value
      })
    )
);
const minX = computed(() => Math.min(...isoCells.value.map(c => c.isoX)));
const maxX = computed(() => Math.max(...isoCells.value.map(c => c.isoX)));
const minY = computed(() => Math.min(...isoCells.value.map(c => c.isoY - c.isoZ)));
const maxY = computed(() => Math.max(...isoCells.value.map(c => c.isoY - c.isoZ)));
const isoBoundingRect = computed(() => ({
  topLeft: { x: minX.value, y: minY.value },
  bottomRight: { x: maxX.value, y: maxY.value }
}));

const WORLD_PADDING = {
  x: CELL_WIDTH * 1,
  y: CELL_HEIGHT * 2
};
const worldSize = computed(() => ({
  width:
    isoBoundingRect.value.bottomRight.x -
    isoBoundingRect.value.topLeft.x +
    WORLD_PADDING.x,
  height:
    isoBoundingRect.value.bottomRight.y -
    isoBoundingRect.value.topLeft.y +
    WORLD_PADDING.y
}));

watchEffect(() => {
  camera.offset.value = {
    x: -minX.value + WORLD_PADDING.x / 2,
    y: -minY.value + WORLD_PADDING.y / 2
  };
});

until(camera.viewport)
  .not.toBe(undefined)
  .then(() => {
    camera.viewport.value
      ?.drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 5, percent: 0.25 })
      .clampZoom({ minScale: 1, maxScale: 3 })
      .setZoom(2, false)
      .pinch()
      .moveCenter(worldSize.value.width / 2, worldSize.value.height / 2);
  });

watch(
  tool,
  tool => {
    if (tool === 'move') {
      camera.viewport.value?.plugins.resume('drag');
    } else {
      camera.viewport.value?.plugins.pause('drag');
    }
  },
  { immediate: true }
);
</script>

<template>
  <viewport
    :ref="
      (el: any) => {
        if (!el) return;

        camera.viewport.value = el;
      }
    "
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="worldSize.width"
    :world-height="worldSize.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <container v-bind="camera.offset.value" :sortable-children="true">
      <slot />
    </container>
  </viewport>
</template>
