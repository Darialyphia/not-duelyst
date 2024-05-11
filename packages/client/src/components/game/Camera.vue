<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { CELL_HEIGHT, CELL_WIDTH } from '@/utils/constants';
import { pointToIndex, type Point } from '@game/shared';
import { Container } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import { throttle } from 'lodash-es';

const app = useApplication();

const { fx, ui } = useGame();

const { camera } = useGame();

const cells = useGameSelector(session => session.boardSystem.cells);
const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));
const isoCells = computed(() =>
  cells.value.map(cell => toIso(cell.position, camera.angle.value, boardDimensions.value))
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
  x: CELL_WIDTH,
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

const isoCenter = computed(() => {
  const i = pointToIndex(
    {
      x: Math.round(boardDimensions.value.width / 2),
      y: Math.round(boardDimensions.value.height / 2)
    },
    boardDimensions.value.width
  );

  return isoCells.value[i];
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
      .zoomPercent(1, false)
      .moveCenter(
        isoCenter.value.isoX + camera.offset.value.x,
        isoCenter.value.isoY + camera.offset.value.y - CELL_HEIGHT / 2
      );
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
