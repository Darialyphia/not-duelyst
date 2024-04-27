<script setup lang="ts">
const { spriteId } = defineProps<{
  spriteId: string;
}>();

const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!assets.loaded.value) return;
  sheet.value = await assets.loadSpritesheet(spriteId);
});

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!sheet.value) return null;

  return {
    style: {
      '--bg': `url(/assets/units/${spriteId}.png)`,
      '--width': `${sheet.value.data.meta.size!.w}px`,
      '--height': `${sheet.value.data.meta.size!.h}px`
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
