<script setup lang="ts">
import { Polygon, type Cursor, FederatedPointerEvent } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../utils/constants';

const { cell } = defineProps<{ cell: Cell }>();

const app = useApplication();
const { assets, state, sendInput, gameSession, mapRotation } = useGame();
const { hoveredCell, targetMode, distanceMap, selectedSummon } = useGameUi();

const spriteTextures = computed(() => {
  return cell.spriteIds.map(spriteId => {
    const sheet = assets.getSprite(spriteId);
    return sheet.animations[Math.abs(mapRotation.value)] ?? sheet.animations[0];
  });
});

const STEP = CELL_SIZE / 4;
const hitAreaYOffset = cell.isHalfTile ? STEP / 2 : 0;
const hitArea = computed(() => {
  //prettier-ignore
  const p = new Polygon([
    { x: STEP * -2, y: STEP + hitAreaYOffset },
    { x: 0        , y: 0 + hitAreaYOffset },
    { x: STEP * 2 , y: STEP  + hitAreaYOffset },
    { x: STEP * 2 , y: STEP * 3 },
    { x: 0        , y: STEP * 4 },
    { x: STEP * -2, y: STEP * 3 }
  ]);

  return p;
});

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

const onPointerup = (event: FederatedPointerEvent) => {
  if (event.button !== 0) return;

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

const cursor = computed(() => {
  if (isMoveTarget.value) {
    return app.value.renderer.events.cursorStyles.move as Cursor;
  }
  if (isSummonTarget.value) {
    return app.value.renderer.events.cursorStyles.summon as Cursor;
  }
  return undefined;
});
</script>

<template>
  <IsoPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <container
      :hit-area="hitArea"
      :cursor="cursor"
      @pointerenter="hoveredCell = cell"
      @pointerleave="hoveredCell = null"
      @pointerup="onPointerup"
    >
      <container
        :filters="isMovePathHighlighted ? [pathFilter] : []"
        :cursor="cursor"
        event-mode="none"
      >
        <animated-sprite
          v-for="(textures, index) in spriteTextures"
          :key="index"
          :textures="textures"
          :cursor="cursor"
          :anchor="0.5"
          :y="CELL_SIZE / 2"
        />
      </container>

      <MapCellHighlight :cell="cell" :cursor="cursor" />
    </container>

    <HoveredCell :cell="cell" :cursor="cursor" />
  </IsoPositioner>
  <IsoPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z + 0.1"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <SummonPreview :cell="cell" />
  </IsoPositioner>
</template>
