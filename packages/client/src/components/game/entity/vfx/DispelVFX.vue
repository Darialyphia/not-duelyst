<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { type FrameObject } from 'pixi.js';
import { PTransition } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();
const entity = useEntity(entityId);

const { assets, ui } = useGame();

const textures = ref<FrameObject[]>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet('silenced');
  textures.value = createSpritesheetFrameObject('default', spritesheet);
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 0 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
  >
    <animated-sprite
      v-if="textures && entity.isDispelled"
      :ref="(container: any) => ui.assignLayer(container, 'ui')"
      :textures="textures"
      :anchor-x="0.5"
      :anchor-y="0"
      event-mode="none"
      loop
      playing
      :z-index="1"
      :y="-CELL_HEIGHT * 0.6"
    />
  </PTransition>
</template>
