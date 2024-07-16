<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import type { Nullable } from '@game/shared';
import type { FrameObject } from 'pixi.js';

const { cellId } = defineProps<{ cellId: CellId }>();

const { camera, fx, assets } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const textures = ref<Nullable<FrameObject[]>>();

watchEffect(async () => {
  if (!cell.value.tile) {
    textures.value = null;
    return;
  }
  const spritesheet = await assets.loadSpritesheet(cell.value.tile.blueprint.spriteId);
  textures.value = createSpritesheetFrameObject('idle', spritesheet);
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
    <container v-if="cell.tile && textures" :y="-CELL_HEIGHT * 0.4" event-mode="none">
      <animated-sprite :textures="textures" :anchor="0.5" playing loop />
    </container>
  </IsoPositioner>
</template>
