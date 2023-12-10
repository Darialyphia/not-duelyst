<script setup lang="ts">
import { Polygon } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';

const { cell } = defineProps<{ cell: Cell }>();

const { assets, state, sendInput, gameSession, mapRotation } = useGame();
const { hoveredCell, targetMode, distanceMap, selectedSummon } = useGameUi();

const textures = computed(() => {
  const sheet = assets.getSprite(cell.tile.id);

  return sheet.animations[Math.abs(mapRotation.value)] ?? sheet.animations[0];
});
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

const isSummonTarget = computed(() => {
  if (targetMode.value !== 'summon') return false;

  return (
    gameSession.map.canSummonAt(cell.position) &&
    gameSession.entityManager.hasNearbyAllies(
      cell.position,
      state.value.activeEntity.playerId
    )
  );
});

const onPointerup = () => {
  if (isMoveTarget.value) {
    sendInput('move', {
      ...cell.position,
      entityId: state.value.activeEntity.id
    });
  } else if (isSummonTarget.value) {
    sendInput('summon', {
      position: cell.position,
      unitId: selectedSummon.value!.id
    });
  }
};

const pathFilter = new ColorOverlayFilter(0x4455bb, 0.5);

const isMovePathHighlighted = computed(() => {
  if (!hoveredCell.value) return false;
  if (targetMode.value !== 'move') return false;

  const entityOnCell = gameSession.entityManager.getEntityAt(cell);
  const hasAlly = entityOnCell?.playerId === state.value.activeEntity.playerId;

  if (!isMoveTarget.value && !hasAlly) return false;

  const path = gameSession.map.getPathTo(
    state.value.activeEntity,
    hoveredCell.value.position,
    state.value.activeEntity.remainingMovement
  );

  if (!path) return false;

  const isInPath = path.path.some(vec => vec.equals(cell.position));

  return isInPath || state.value.activeEntity.id === entityOnCell?.id;
});
</script>

<template>
  <IsoPositioner :x="cell.position.x" :y="cell.position.y" :z="cell.position.z">
    <container
      :hit-area="hitArea"
      @pointerenter="hoveredCell = cell"
      @pointerleave="hoveredCell = null"
      @pointerup="onPointerup"
    >
      <animated-sprite
        :filters="isMovePathHighlighted ? [pathFilter] : []"
        :textures="textures"
        :anchor-x="0.5"
      />

      <MapCellHighlight :cell="cell" />
    </container>
    <HoveredCell :cell="cell" />
  </IsoPositioner>
  <IsoPositioner :x="cell.position.x" :y="cell.position.y" :z="cell.position.z + 0.1">
    <SummonPreview :cell="cell" />
  </IsoPositioner>
</template>
