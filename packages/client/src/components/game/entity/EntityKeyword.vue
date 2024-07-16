<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Keyword } from '@game/sdk';
import type { FrameObject } from 'pixi.js';

const { keyword } = defineProps<{
  keyword: Keyword;
}>();

const { assets } = useGame();
const textures = ref<FrameObject[]>();

watchEffect(async () => {
  if (!keyword.spriteId) return;
  const spritesheet = await assets.loadSpritesheet(keyword.spriteId);
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
      v-if="textures"
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
