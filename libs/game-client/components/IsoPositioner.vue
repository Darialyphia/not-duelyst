<script setup lang="ts">
import { CELL_SIZE } from '../utils/constants';
import { useApplication } from 'vue3-pixi';

const { x, y, z } = defineProps<{
  x: number;
  y: number;
  z: number;
}>();

const app = useApplication();
const { state, mapRotation } = useGame();
const position = computed(() =>
  toIso({ x, y, z }, mapRotation.value, {
    width: state.value.map.width / 2,
    height: state.value.map.height / 2
  })
);

const rotatedCartesian = computed(() =>
  toCartesian({
    isoX: position.value.isoX / (CELL_SIZE / 2),
    isoY: position.value.isoY / (CELL_SIZE / 2),
    isoZ: position.value.isoZ
  })
);
</script>

<template>
  <AnimatedPosition
    :x="position.isoX"
    :y="position.isoY - position.isoZ"
    :z="position.isoZ"
    :z-index="
      Math.round((rotatedCartesian.x + rotatedCartesian.y) * (z + 1) + state.map.width)
    "
  >
    <slot />
  </AnimatedPosition>
</template>
