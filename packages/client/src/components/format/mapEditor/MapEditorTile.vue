<script setup lang="ts">
import { TILES } from '@game/sdk/src/tile/tile-lookup';
import type { Nullable, Point3D } from '@game/shared';
import type { FrameObject } from 'pixi.js';

const { tileId, position } = defineProps<{ tileId: string; position: Point3D }>();

const { camera, assets, dimensions } = useMapEditor();

const textures = ref<Nullable<FrameObject[]>>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(TILES[tileId].spriteId);
  textures.value = createSpritesheetFrameObject('idle', spritesheet);
});

const boardDimensions = {
  width: dimensions.x.value,
  height: dimensions.y.value
};
</script>

<template>
  <IsoPositioner
    :animated="false"
    v-bind="position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :z-index-offset="1"
    event-mode="none"
  >
    <container v-if="textures" :y="-CELL_HEIGHT * 0.4" event-mode="none">
      <animated-sprite :textures="textures" :anchor="0.5" playing loop />
    </container>
  </IsoPositioner>
</template>
