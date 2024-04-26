<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, camera, fx } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const tileDiffuseTexture = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});
const tileNormalTextures = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :z-index-offset="1"
  >
    <container
      v-if="cell.tile && tileDiffuseTexture && tileNormalTextures"
      :y="-CELL_HEIGHT * 0.4"
      event-mode="none"
    >
      <PointLight
        v-if="cell.tile.blueprint.lightColor"
        :color="cell.tile.blueprint.lightColor"
        :brightness="0.5"
        :x="0"
        :y="0"
      />

      <IlluminatedSprite
        :diffuse-textures="tileDiffuseTexture"
        :normal-textures="tileNormalTextures"
        :anchor="0.5"
        playing
        loop
      />
    </container>
  </IsoPositioner>
</template>
