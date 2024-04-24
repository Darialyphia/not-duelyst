<script setup lang="ts">
import type { Spritesheet } from 'pixi.js';

const { camera, fx, assets, session } = useGame();

const cells = useGameSelector(session => session.boardSystem.cells);
const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const OFFSET = 0;
const edgeCells = computed(() =>
  cells.value.filter(
    cell =>
      cell.z === 0 &&
      (cell.x === OFFSET ||
        cell.y === OFFSET ||
        cell.x === boardDimensions.value.width - 1 + OFFSET ||
        cell.y === boardDimensions.value.height - 1 + OFFSET)
  )
);

const water = Array.from({ length: session.boardSystem.height + 7 }, (_, y) =>
  Array.from({ length: session.boardSystem.width + 7 }, (_, x) => ({
    x: x,
    y: y,
    z: -1
  }))
)
  .flat()
  .filter(
    cell =>
      cell.x < OFFSET ||
      cell.x >= session.boardSystem.width ||
      cell.y < OFFSET ||
      cell.y >= session.boardSystem.height
  );

const waterTextures = computed(() => {
  const sheet = assets.getSpritesheet('water');
  return sheet.animations[0];
});
const waterNormalSheet = ref<Spritesheet | null>(null);
const waterNormalTextures = computed(() => {
  if (!waterNormalSheet.value) return null;

  return waterNormalSheet.value.animations[0];
});

const diffuseTextures = computed(() => {
  const sheet = assets.getSpritesheet('ground');

  return sheet.animations[0];
});

const normalSheet = ref<Spritesheet | null>(null);

onMounted(async () => {
  const diffuseSheet = assets.getSpritesheet('ground');
  const waterDiffuseSheet = assets.getSpritesheet('water');
  normalSheet.value = await assets.loadNormalSpritesheet('ground', diffuseSheet);
  waterNormalSheet.value = await assets.loadNormalSpritesheet('water', waterDiffuseSheet);
});
const normalTextures = computed(() => {
  if (!normalSheet.value) return null;

  return normalSheet.value.animations[0];
});
</script>

<template>
  <template v-for="(cell, index) in edgeCells" :key="index">
    <IsoPositioner
      :animated="!fx.isPlaying.value"
      v-bind="cell.position"
      :z="-1"
      :angle="camera.angle.value"
      :height="boardDimensions.height"
      :width="boardDimensions.width"
    >
      <IlluminatedSprite
        v-if="diffuseTextures && normalTextures"
        :diffuse-textures="diffuseTextures"
        :normal-textures="normalTextures"
        :anchor="0.5"
        event-mode="none"
      />
    </IsoPositioner>
  </template>
  <!-- <template v-for="(cell, index) in water" :key="index">
    <IsoPositioner
      :animated="!fx.isPlaying.value"
      v-bind="cell"
      :angle="camera.angle.value"
      :height="boardDimensions.height"
      :width="boardDimensions.width"
    >
      <IlluminatedSprite
        v-if="waterTextures && waterNormalTextures"
        :diffuse-textures="waterTextures"
        :normal-textures="waterNormalTextures"
        :anchor="0.5"
        event-mode="none"
      />
    </IsoPositioner>
  </template> -->
</template>
