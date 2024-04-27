<script setup lang="ts">
const { pedestalId } = defineProps<{
  pedestalId: string;
}>();

const { assets } = useGame();

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!assets.loaded.value) return null;

  const sheet = assets.getSpritesheet(pedestalId);
  return {
    style: {
      '--bg': `url(/assets/pedestals/${pedestalId}.png)`,
      '--width': `${sheet.data.meta.size!.w}px`,
      '--height': `${sheet.data.meta.size!.h}px`
    }
  };
});
</script>

<template>
  <div v-if="item" ref="el" class="pedestal-sprite" :style="item.style" />
</template>

<style scoped lang="postcss">
.pedestal-sprite {
  width: 96px;
  height: 112px;

  background: var(--bg);
  background-size: cover;

  image-rendering: pixelated;
}
</style>
