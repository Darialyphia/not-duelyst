<script setup lang="ts">
import type { Point3D } from '@hc/sdk';
import { rotate } from '../../utils/rotate-map';

const {
  x,
  y,
  z,
  offset = { x: 0, y: 0, z: 0 },
  zIndexOffset = 0,
  map,
  animated = true
} = defineProps<{
  x: number;
  y: number;
  z: number;
  offset?: Point3D;
  zIndexOffset?: number;
  map: { width: number; height: number; rotation: 0 | 90 | 180 | 270 };
  animated?: boolean;
}>();

const position = computed(() =>
  toIso({ x, y, z }, map.rotation, {
    width: map.width / 2,
    height: map.height / 2
  })
);

const rotatedCartesian = computed(() => {
  const track = { x, y, z };

  const floor: any[][] = [];
  for (let floorY = 0; floorY <= map.height; floorY++) {
    const row: any[] = [];
    floor.push(row);
    for (let floorX = 0; floorX <= map.width; floorX++) {
      row.push(
        Math.round(track.x) === floorX && Math.round(track.y) === floorY ? track : null
      );
    }
  }

  const rotatedFloor = rotate(floor, map.rotation).flatMap((row, y) =>
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
  <container
    v-if="!animated"
    :x="position.isoX + offset.x"
    :y="position.isoY - position.isoZ + offset.y"
    :z-index="zIndex"
  >
    <slot />
  </container>

  <AnimatedPosition
    v-else
    :x="position.isoX + offset.x"
    :y="position.isoY - position.isoZ + offset.y"
    :z="position.isoZ + offset.z"
    :z-index="zIndex"
  >
    <slot />
  </AnimatedPosition>
</template>
