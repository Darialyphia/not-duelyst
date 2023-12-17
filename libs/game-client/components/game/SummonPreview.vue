<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Container, Cursor } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { AdjustmentFilter } from '@pixi/filter-adjustment';

const { cell } = defineProps<{
  cursor?: Cursor;
  cell: Cell;
}>();

const { state, gameSession, mapRotation, assets } = useGame();
const { selectedSummon, hoveredCell, targetMode } = useGameUi();

const isSummonTarget = computed(() => {
  if (targetMode.value !== 'summon') return false;

  return (
    gameSession.map.canSummonAt(cell.position) &&
    gameSession.entityManager.hasNearbyAllies(
      cell.position,
      state.value.activeEntity.playerId
    )
  );
});

const sheet = computed(() => {
  if (!selectedSummon.value) return null;
  return assets.getSprite(selectedSummon.value.id, 'placeholder-unit');
});
const textures = computed(() =>
  sheet.value ? createSpritesheetFrameObject('idle', sheet.value) : null
);
const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return state.value.activeEntity.playerId === state.value.players[0].id ? -1 : 1;
  }

  return state.value.activeEntity.playerId === state.value.players[0].id ? 1 : -1;
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
