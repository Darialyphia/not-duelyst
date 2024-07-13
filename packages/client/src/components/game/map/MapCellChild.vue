<script setup lang="ts">
import type { FrameObject } from 'pixi.js';

const { spriteId } = defineProps<{ spriteId: string }>();

const { assets } = useGame();
const textures = ref<FrameObject[]>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(spriteId);
  textures.value = createSpritesheetFrameObject('default', spritesheet);
});
</script>

<template>
  <animated-sprite v-if="textures" :textures="textures" :playing="true" :anchor="0.5" />
</template>
