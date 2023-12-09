<script setup lang="ts">
import type { Cell } from '@hc/sdk/src/map/cell';

const { cell } = defineProps<{ cell: Cell }>();
const { hoveredCell } = useGameUi();

const { assets } = useGame();
const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSprite('hovered_cell'))
);
</script>

<template>
  <animated-sprite
    v-if="hoveredCell?.id === cell.id"
    :x="0"
    :y="CELL_SIZE / 2"
    :event-mode="'none'"
    :anchor="0.5"
    playing
    :textures="textures"
  />
</template>
