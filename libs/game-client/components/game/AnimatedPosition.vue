<script setup lang="ts">
import gsap from 'gsap';
import type { Container } from 'pixi.js';

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  debug?: boolean;
  speed?: number;
  zIndex: number;
}>();

// const { isPlaying } = useFXSequencer();
const tweened = ref({ x: props.x, y: props.y });

const { fx } = useGame();
watch(
  () => ({ x: props.x, y: props.y }),
  newPos => {
    gsap.to(tweened.value, {
      duration: fx.isMoving.value ? 0 : props.speed ?? 0.5,
      x: newPos.x,
      ease: fx.isMoving.value ? Power0.easeNone : Power2.easeOut
    });
    gsap.to(tweened.value, {
      duration: fx.isMoving.value ? 0 : props.speed ?? 0.5,
      y: newPos.y,
      ease: fx.isMoving.value ? Power0.easeNone : Power2.easeOut
    });
  }
);

const tileWidth = CELL_SIZE;
const tileHeight = tileWidth / 2;

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <container
    :ref="
      _container => {
        if (!_container) return;
        autoDestroyRef(_container);
      }
    "
    :x="tweened.x"
    :y="tweened.y"
    :z-order="props.zIndex"
    :z-index="props.zIndex"
  >
    <slot />
  </container>
  <text
    v-if="props.debug"
    :ref="el => autoDestroyRef(el)"
    :style="{ fontSize: 20, fill: 'white' }"
    :scale="0.5"
    :z-index="1000"
    :x="tweened.x"
    :anchor="0.5"
    :y="tweened.y + tileHeight * 4"
  >
    {{ props.zIndex }}
  </text>
</template>
