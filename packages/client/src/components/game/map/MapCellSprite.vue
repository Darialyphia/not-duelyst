<script setup lang="ts">
import type { FrameObject } from 'pixi.js';
import type { CellViewModel } from '~/composables/useCell';
import { Hitbox } from '~/utils/hitbox';

const { cell } = defineProps<{ cell: CellViewModel }>();

const { assets, fx, camera } = useGame();

const textures = ref<FrameObject[]>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(cell.spriteId);
  textures.value = createSpritesheetFrameObject(
    `${cell.defaultRotation + camera.angle.value}`,
    spritesheet
  );
});

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, {
  x: 0.5,
  y: 0.25
});

const children = computed(() => {
  return fx.cellChildSpritesMap.value.get(cell.id);
});
</script>

<template>
  <animated-sprite
    v-if="textures"
    :textures="textures"
    :anchor="0.5"
    :hit-area="hitArea"
    :y="-14"
  />

  <!-- <MapEdge :cell-id="cellId" /> -->

  <MapCellChild v-for="spriteId in children" :key="spriteId" :sprite-id="spriteId" />
</template>
