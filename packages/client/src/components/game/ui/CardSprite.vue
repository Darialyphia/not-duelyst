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

const PEDESTAL_SIZE = {
  w: 96,
  h: 112
};
const item = computed(() => {
  if (!sheet.value) return null;
  const { spriteSourceSize } = Object.values(sheet.value.data.frames)[0];
  return {
    style: {
      '--bg': `url(/assets/units/${spriteId}.png)`,
      '--width': `${spriteSourceSize?.w}px`,
      '--height': `${spriteSourceSize?.h}px`
    }
  };
});
</script>

<template>
  <div class="card-sprite">
    <div
      v-if="pedestalId"
      :style="{ '--bg': `url(/assets/pedestals/${pedestalId}.png)` }"
    />
    <div v-if="item" :style="item.style" />
  </div>
</template>

<style scoped lang="postcss">
.card-sprite {
  --pedestal-frame-w: 96px;
  --pedestal-frame-h: 112px;

  position: relative;

  > div {
    pointer-events: none;

    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);

    background: var(--bg);
    background-repeat: no-repeat;
  }

  > div:first-child {
    width: var(--pedestal-frame-w);
    height: var(--pedestal-frame-h);
    background-position: 0 24px;
  }

  > div:last-child {
    width: var(--width);
    height: var(--height);

    background-position: 0px 0px;
    background-size: cover;

    image-rendering: pixelated;
  }
}
</style>
