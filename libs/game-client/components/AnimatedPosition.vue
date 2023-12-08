<script setup lang="ts">
import gsap from 'gsap';
import type { Point3D } from '../../sdk/src/types';

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

watch(
  () => ({ x: props.x, y: props.y }),
  newPos => {
    gsap.to(tweened.value, {
      duration: props.speed ?? 0.3,
      x: newPos.x,
      ease: Power2.easeOut
    });
    gsap.to(tweened.value, {
      duration: props.speed ?? 0.3,
      y: newPos.y,
      ease: Power2.easeOut
    });
  }
);

const tileWidth = CELL_SIZE;
const tileHeight = tileWidth / 2;

const cartesian = computed(() =>
  toCartesian({
    isoX: tweened.value.x / (CELL_SIZE / 2),
    isoY: tweened.value.y / (CELL_SIZE / 2),
    isoZ: props.z / (CELL_SIZE / 2)
  })
);

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <container :ref="autoDestroyRef" :x="tweened.x" :y="tweened.y" :z-index="props.zIndex">
    <slot />
  </container>
  <text
    v-if="props.debug"
    :ref="autoDestroyRef"
    :style="{ fontSize: 20, fill: 'white' }"
    :scale="0.5"
    :z-index="1000"
    :x="tweened.x"
    :anchor="0.5"
    :y="tweened.y + tileHeight * 4"
  >
    {{ props.zIndex }}\n{{ cartesian.x }}:{{ cartesian.y }}:{{ cartesian.z }}
  </text>
</template>
