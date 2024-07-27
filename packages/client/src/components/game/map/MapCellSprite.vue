<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter, FrameObject } from 'pixi.js';
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
    :y="-14"
    :is-animated="false"
  />

  <!-- <MapEdge :cell-id="cellId" /> -->

  <MapCellChild v-for="spriteId in children" :key="spriteId" :sprite-id="spriteId" />
</template>
