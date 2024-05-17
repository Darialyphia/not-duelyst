<script setup lang="ts">
import type { Point } from '@game/shared';
import { rotate } from '../../utils/rotate-map';
import type { Container } from 'pixi.js';

const {
  x,
  y,
  z,
  offset = { x: 0, y: 0, z: 0 },
  zIndexOffset = 0,
  angle,
  width,
  height,
  animated,
  debug = false
} = defineProps<{
  x: number;
  y: number;
  z: number;
  height: number;
  width: number;
  offset?: Point;
  zIndexOffset?: number;
  angle: RotationAngle;
  animated: boolean;
  debug?: boolean;
}>();

const position = computed(() => {
  return toIso({ x, y, z }, angle, {
    width,
    height
  });
});

const { autoDestroyRef } = useAutoDestroy();

const containerX = computed(() => position.value.isoX + offset.x);
const containerY = computed(() => position.value.isoY - position.value.isoZ + offset.y);
const settings = useUserSettings();

const rotatedCartesian = computed(() => {
  const track = { x, y, z };

  const hackX = angle === 270 || angle === 180 ? Math.floor : Math.ceil;
  const hackY = angle === 90 || angle === 180 ? Math.floor : Math.ceil;

  const bounds = {
    height: Math.max(height, y + 1),
    width: Math.max(width, x + 1)
  };
  const floor: any[][] = [];
  for (let floorY = 0; floorY <= bounds.height; floorY++) {
    const row: any[] = [];
    floor.push(row);
    for (let floorX = 0; floorX <= bounds.width; floorX++) {
      row.push(hackX(track.x) === floorX && hackY(track.y) === floorY ? track : null);
    }
  }

  const rotatedFloor = rotate(floor, angle).flatMap((row, y) =>
    row.map((track, x) => ({
      track,
      floorX: x,
      floorY: y
    }))
  );
  const rotatedCell = rotatedFloor.find(cell => cell.track === track)!;

  return {
    x: rotatedCell?.floorX ?? 0,
    y: rotatedCell?.floorY ?? 0,
    z
  };
});

const zIndex = computed(() => {
  return (
    rotatedCartesian.value.x * 2 +
    rotatedCartesian.value.y * 2 +
    rotatedCartesian.value.z * 3 +
    zIndexOffset +
    containerY.value / 1000 // hack hack hack hack
  );
});

const tweened = ref({ x: containerX.value, y: containerY.value });

watch([containerX, containerY], ([newX, newY]) => {
  if (animated && !settings.value.a11y.reducedMotions) {
    gsap.to(tweened.value, {
      duration: 0.7,
      x: newX,
      y: newY,
      ease: animated ? Power3.easeOut : Power0.easeOut
    });
  } else {
    tweened.value = { x: newX, y: newY };
  }
});

const root = ref<Container>();
</script>

<template>
  <container
    v-bind="$attrs"
    :ref="
      _container => {
        if (!_container) return;
        root = _container as any;
        autoDestroyRef(_container);
      }
    "
    :x="tweened.x"
    :y="tweened.y"
    :z-order="zIndex"
    :z-index="zIndex"
  >
    <slot />
    <text
      v-if="debug"
      :style="{ fill: 'white', fontSize: 35, fontFamily: 'monospace' }"
      :scale="0.25"
      :anchor="0.5"
      event-mode="none"
    >
      {{ zIndex.toFixed(1) }}
    </text>
  </container>
</template>
