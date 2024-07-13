<script setup lang="ts">
import type { Animation } from '@game/sdk';

const { spriteId, pedestalId, animation } = defineProps<{
  spriteId: string;
  pedestalId?: string;
  animation?: Animation;
}>();
const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!assets.loaded.value) return;
  sheet.value = await assets.loadSpritesheet(spriteId);
});

const isHovered = ref(false);

const currentAnimation = computed(() => {
  if (!animation) return null;
  return sheet.value ? sheet.value.animations[animation] : null;
});

const frame = ref(0);

const frameDuration = computed(() => {
  return 80;
});

useIntervalFn(() => {
  if (!currentAnimation.value) return;
  frame.value = (frame.value + 1) % (currentAnimation.value.length - 1);
}, frameDuration);

watch([() => isHovered], () => {
  frame.value = 0;
});

const pedestalSheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!pedestalId) return;
  if (!assets.loaded.value) return;
  pedestalSheet.value = await assets.loadSpritesheet(pedestalId);
});

const staticStyle = computed(() => {
  if (!sheet.value) return null;
  const { sourceSize } = Object.values(sheet.value.data.frames)[0];
  return {
    '--bg': `url(/assets/units/${spriteId}.png)`,
    '--width': `${sourceSize?.w}px`,
    '--height': `${sourceSize?.h}px`,
    '--pos-x': 0,
    '--pos-y': 0
  };
});

const animatedStyle = computed(() => {
  if (!sheet.value) return null;
  if (!currentAnimation.value) return;

  const bg = sheet.value.baseTexture.resource.src;
  const texture = currentAnimation.value[frame.value];
  return {
    '--width': `${texture?.orig.width}px`,
    '--height': `${texture?.orig.height}px`,
    '--bg': `url('${bg}')`,
    '--pos-x': `-${texture?.orig.x}px`,
    '--pos-y': `-${texture?.orig.y}px`
  };
});

const style = computed(() =>
  currentAnimation.value ? animatedStyle.value : staticStyle.value
);
</script>

<template>
  <div class="card-sprite">
    <div
      v-if="pedestalId"
      :style="{ '--bg': `url(/assets/pedestals/${pedestalId}.png)` }"
    />
    <div v-if="style" :style="style" />
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
    background-position: var(--pos-x) var(--pos-y);
    image-rendering: pixelated;
  }
}
</style>
