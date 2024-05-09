<script setup lang="ts">
const { spriteId, pedestalId } = defineProps<{
  spriteId: string;
  pedestalId?: string;
}>();

const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!assets.loaded.value) return;
  sheet.value = await assets.loadSpritesheet(spriteId);
});

const pedestalSheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!pedestalId) return;
  if (!assets.loaded.value) return;
  pedestalSheet.value = await assets.loadSpritesheet(pedestalId);
});

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!sheet.value) return null;

  return {
    style: {
      '--bg': pedestalSheet.value
        ? `url(/assets/units/${spriteId}.png), url(/assets/pedestals/${pedestalId}.png)`
        : `url(/assets/units/${spriteId}.png)`,
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
