<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Cursor } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { AdjustmentFilter } from '@pixi/filter-adjustment';

const { cell } = defineProps<{
  cursor?: Cursor;
  cell: Cell;
}>();

const { state, mapRotation, assets, utils } = useGame();
const { selectedSummon, hoveredCell } = useGameUi();

const isSummonTarget = computed(() => utils.isSummonTarget(cell.position));

const sheet = computed(() => {
  if (!selectedSummon.value) return null;
  return assets.getSprite(selectedSummon.value.spriteId, 'placeholder-unit');
});
const textures = computed(() =>
  sheet.value ? createSpritesheetFrameObject('idle', sheet.value) : null
);
const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return state.value.activePlayer.id === state.value.players[0].id ? -1 : 1;
  }

  return state.value.activePlayer.id === state.value.players[0].id ? 1 : -1;
});
const filters = [
  new AdjustmentFilter({
    brightness: 2,
    alpha: 0.35
  })
];
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 100, leave: 100 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <animated-sprite
      v-if="isSummonTarget && hoveredCell?.id === cell.id && textures"
      :event-mode="'none'"
      :textures="textures"
      :scale-x="scaleX"
      :anchor="0.5"
      :playing="false"
      :filters="filters"
      :y="cell.isHalfTile ? CELL_SIZE / 4 : 0"
    />
  </PTransition>
</template>
