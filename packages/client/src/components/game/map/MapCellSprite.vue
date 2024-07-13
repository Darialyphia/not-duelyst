<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter, FrameObject, Spritesheet } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, ui, fx, camera } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const textures = ref<FrameObject[]>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(cell.value.spriteId);
  textures.value = createSpritesheetFrameObject(
    `${cell.value.defaultRotation + camera.angle.value}`,
    spritesheet
  );
});

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, {
  x: 0.5,
  y: 0.25
});

const targetedFilter = new ColorOverlayFilter(0xff0000, 0.5);

const filters = computed(() => {
  const result: Filter[] = [];
  if (fx.isPlaying.value) return result;
  // if (isMovePathHighlighted.value) result.push(pathFilter);
  if (
    ui.selectedEntity.value &&
    ui.hoveredCell.value?.equals(cell.value) &&
    ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
    ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
    ui.targetingMode.value === TARGETING_MODES.BASIC
  ) {
    result.push(targetedFilter);
  }

  return result;
});

const children = computed(() => {
  return fx.cellChildSpritesMap.value.get(cellId);
});
</script>

<template>
  <animated-sprite
    v-if="textures"
    :textures="textures"
    :anchor="0.5"
    :hit-area="hitArea"
    :filters="filters"
    :y="-14"
    :is-animated="false"
  />

  <!-- <MapEdge :cell-id="cellId" /> -->

  <MapCellChild v-for="spriteId in children" :key="spriteId" :sprite-id="spriteId" />
</template>
