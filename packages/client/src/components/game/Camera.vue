<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { CELL_HEIGHT, CELL_WIDTH } from '@/utils/constants';
import { Container } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import { throttle } from 'lodash-es';

const app = useApplication();

const { fx, ui, camera, session } = useGame();
const { isMobile } = useResponsive();
const cells = session.boardSystem.cells;
const boardDimensions = {
  width: session.boardSystem.width,
  height: session.boardSystem.height
};
const isoCells = computed(() =>
  cells
    .filter(
      cell =>
        cell.position.x < boardDimensions.width &&
        cell.position.x >= 0 &&
        cell.position.y < boardDimensions.height &&
        cell.position.y >= 0
    )
    .map(cell => toIso(cell.position, camera.angle.value, boardDimensions))
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
      .wheel({ smooth: 20, percent: 0.05 })
      .clamp({
        direction: 'all'
      })
      .clampZoom({ minScale: 1, maxScale: 3 })
      .setZoom(isMobile.value ? 1 : 2, false)
      .mouseEdges({
        distance: 10,
        speed: 15,
        allowButtons: true
      })
      .pinch({ noDrag: true })
      .moveCenter(worldSize.value.width / 2, worldSize.value.height / 2);
  });
useEventListener('resize', () => {
  setTimeout(() => {
    camera.viewport.value?.resize(window.innerWidth, window.innerHeight);
  }, 100);
});

const onMousemove = throttle((e: FederatedPointerEvent) => {
  const pos = camera.viewport.value!.toWorld(e.global);
  ui.mousePosition.value = {
    x: pos.x - camera.offset.value.x,
    y: pos.y - camera.offset.value.y
  };
}, 50);
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
    @pointermove="onMousemove"
    @pointerup="
      (e: FederatedPointerEvent) => {
        if (e.target === camera.viewport.value) {
          ui.unselectCard();
          ui.unselectEntity();
        }
      }
    "
  >
    <container
      v-bind="camera.offset.value"
      :ref="
        (container: any) => {
          if (container instanceof Container) {
            fx.registerRoot(container);
          }
        }
      "
      :sortable-children="true"
    >
      <slot />
    </container>
  </viewport>

  <Fps />
</template>
