<script setup lang="ts">
import type { Point3D } from '@hc/sdk';
import { CELL_SIZE } from '../../utils/constants';
import { useApplication } from 'vue3-pixi';
import { rotate } from '../../utils/rotate-map';

const {
  x,
  y,
  z,
  offset = { x: 0, y: 0, z: 0 },
  zIndexOffset = 0
} = defineProps<{
  x: number;
  y: number;
  z: number;
  offset?: Point3D;
  zIndexOffset?: number;
}>();

const { state, mapRotation } = useGame();
const position = computed(() =>
  toIso({ x, y, z }, mapRotation.value, {
    width: state.value.map.width / 2,
    height: state.value.map.height / 2
  })
);

const rotatedCartesian = computed(() => {
  const track = { x, y, z };

  const floor: any[][] = [];
  for (let floorY = 0; floorY <= state.value.map.height; floorY++) {
    const row: any[] = [];
    floor.push(row);
    for (let floorX = 0; floorX <= state.value.map.width; floorX++) {
      row.push(
        Math.round(track.x) === floorX && Math.round(track.y) === floorY ? track : null
      );
    }
  }

  const rotatedFloor = rotate(floor, mapRotation.value).flatMap((row, y) =>
    row.map((track, x) => ({
      track,
      floorX: x,
      floorY: y
    }))
  );
  const rotatedCell = rotatedFloor.find(cell => cell.track === track)!;

  return {
    x: rotatedCell.floorX,
    y: rotatedCell.floorY,
    z
  };
});

const zIndex = computed(() => {
  return (
    rotatedCartesian.value.x +
    rotatedCartesian.value.y +
    rotatedCartesian.value.z +
    zIndexOffset
  );
});
</script>

<template>
  <AnimatedPosition
    :x="position.isoX + offset.x"
    :y="position.isoY - position.isoZ + offset.y"
    :z="position.isoZ + offset.z"
    :z-index="zIndex"
  >
    <slot />
  </AnimatedPosition>
</template>
