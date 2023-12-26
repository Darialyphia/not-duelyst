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
const { selectedSummon, hoveredCell, summonSpawnPoint, targetMode } = useGameUi();

const isSummonTarget = computed(() => utils.canSummonAt(cell.position));

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

const isDisplayed = computed(() => {
  return (
    (isSummonTarget.value && hoveredCell.value?.id === cell.id) ||
    (targetMode.value === 'summon-targets' &&
      summonSpawnPoint.value &&
      cell.position.equals(summonSpawnPoint.value))
  );
});
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
      v-if="isDisplayed && textures"
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
