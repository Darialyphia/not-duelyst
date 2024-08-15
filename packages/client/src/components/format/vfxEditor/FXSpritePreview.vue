<script setup lang="ts">
import type { Animation } from '@game/sdk';

const { spriteId, animation } = defineProps<{
  spriteId?: string;
  animation?: Animation;
}>();
const assets = useAssets();

const sheet = ref<SpritesheetWithAnimations>();
watchEffect(async () => {
  if (!assets.loaded.value) return;
  if (!spriteId) return;
  sheet.value = await assets.loadSpritesheet(spriteId);
});

const isHovered = ref(false);

const currentAnimation = computed(() => {
  if (!sheet.value) return null;
  if (!animation) return Object.values(sheet.value.animations).flat();
  return sheet.value ? sheet.value.animations[animation] : null;
});

const frame = ref(0);

const DEFAULT_FRAME_DURATION = 80;
const frameDuration = computed(() => {
  if (!animation || !sheet.value) return DEFAULT_FRAME_DURATION;
  const frameName = sheet.value.data.animations![animation]?.[frame.value];
  if (!frameName) return DEFAULT_FRAME_DURATION;
  // @ts-expect-error shut up typescript, duration exists, we put it there with the custom aseprite parser
  return sheet.value.data.frames[frameName]?.duration ?? DEFAULT_FRAME_DURATION;
});

useIntervalFn(() => {
  if (!currentAnimation.value) return;
  frame.value = (frame.value + 1) % (currentAnimation.value.length - 1);
}, frameDuration);

watch([() => isHovered], () => {
  frame.value = 0;
});

const style = computed(() => {
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
</script>

<template>
  <div v-if="style" class="fx-sprite" :style="style" />
</template>

<style scoped lang="postcss">
.fx-sprite {
  pointer-events: none;

  width: var(--width);
  height: var(--height);

  background: var(--bg);
  background-repeat: no-repeat;
  background-position: var(--pos-x) var(--pos-y);

  image-rendering: pixelated;
}
</style>
