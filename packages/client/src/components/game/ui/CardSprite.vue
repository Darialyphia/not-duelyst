<script setup lang="ts">
const { spriteId } = defineProps<{
  spriteId: string;
}>();

const { assets } = useGame();

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!assets.loaded.value) return null;

  const sheet = assets.getSpritesheet(spriteId);
  return {
    style: {
      '--bg': `url(/assets/units/${spriteId}.png)`,
      '--width': `${sheet.data.meta.size!.w}px`,
      '--height': `${sheet.data.meta.size!.h}px`
    }
  };
});
</script>

<template>
  <div v-if="item" ref="el" class="card-sprite" :style="item.style" />
</template>

<style scoped lang="postcss">
.card-sprite {
  width: 96px;
  height: 112px;

  background: var(--bg);
  background-size: cover;

  image-rendering: pixelated;
}
</style>
