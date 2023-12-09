<script setup lang="ts">
import { Polygon } from 'pixi.js';
import type { GameState } from '@hc/sdk';

const { cell } = defineProps<{ cell: GameState['map']['cells'][number] }>();
const emit = defineEmits<{}>();

const { assets } = useGame();

const hitArea = new Polygon([
  { x: 0, y: 0 },
  { x: CELL_SIZE / 2, y: CELL_SIZE / 4 },
  { x: CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE },
  { x: -CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: -CELL_SIZE / 2, y: CELL_SIZE / 4 }
]);

const isHovered = ref(false);
</script>

<template>
  <IsoPositioner :x="cell.position.x" :y="cell.position.y" :z="cell.position.z">
    <animated-sprite
      :textures="assets.getSprite(cell.tile.id).animations['0']"
      :anchor-x="0.5"
      :hit-area="hitArea"
      @pointerenter="isHovered = true"
      @pointerleave="isHovered = false"
    >
      <HoveredCell v-if="isHovered" />
    </animated-sprite>
  </IsoPositioner>
</template>
