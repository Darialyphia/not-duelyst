<script setup lang="ts">
import { Polygon } from 'pixi.js';
import type { Cell } from '@hc/sdk/src/map/cell';

const { cell } = defineProps<{ cell: Cell }>();

const { assets, state, sendInput } = useGame();
const { hoveredCell, targetMode, distanceMap } = useGameUi();

const hitArea = new Polygon([
  { x: 0, y: 0 },
  { x: CELL_SIZE / 2, y: CELL_SIZE / 4 },
  { x: CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE },
  { x: -CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: -CELL_SIZE / 2, y: CELL_SIZE / 4 }
]);

const isMoveTarget = computed(() => {
  if (targetMode.value !== 'move') return false;
  return state.value.activeEntity.canMove(distanceMap.value.get(cell.position));
});

const onPointerup = () => {
  if (isMoveTarget.value) {
    sendInput('move', {
      ...cell.position,
      entityId: state.value.activeEntity.id
    });
  }
};
</script>

<template>
  <IsoPositioner :x="cell.position.x" :y="cell.position.y" :z="cell.position.z">
    <animated-sprite
      :textures="assets.getSprite(cell.tile.id).animations['0']"
      :anchor-x="0.5"
      :hit-area="hitArea"
      @pointerenter="hoveredCell = cell"
      @pointerleave="hoveredCell = null"
      @pointerup="onPointerup"
    >
      <HoveredCell :cell="cell" />
    </animated-sprite>
  </IsoPositioner>
</template>
