<script setup lang="ts">
const { pedestalId } = defineProps<{
  pedestalId: string;
}>();

const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!assets.loaded.value) return;
  sheet.value = await assets.loadSpritesheet(pedestalId);
});

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!sheet.value) return null;

  return {
    style: {
      '--bg': `url(/assets/pedestals/${pedestalId}.png)`,
      '--width': `${sheet.value.data.meta.size!.w}px`,
      '--height': `${sheet.value.data.meta.size!.h}px`
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
