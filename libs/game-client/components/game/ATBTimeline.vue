<script setup lang="ts">
import { unitImagesPaths } from '../../assets/units';
import havenBorder from '../../assets/ui/icon-border-haven.png';

const { state, gameSession } = useGame();
const { selectedEntity } = useGameUi();
const timeline = computed(() => gameSession.atb.getTimeline(state.value.entities, 10));
</script>

<template>
  <div class="timeline content-surface">
    <button
      v-for="(entity, index) in timeline"
      :key="index"
      :style="{
        '--rotate-y': entity.playerId === state.players[0].id ? 0 : 180,
        '--bg': `url(${unitImagesPaths[entity.unitId + '-icon']})`,
        '--border': `url(${havenBorder})`
      }"
      @mouseenter="selectedEntity = state.entities.find(e => e.id === entity.id)"
      @mouseleave="selectedEntity = null"
    />
  </div>
</template>

<style scoped lang="postcss">
.timeline {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-2);

  border-radius: var(--radius-3);

  button {
    all: initial;

    transform-origin: 50% 50%;
    transform: rotateY(calc(1deg * var(--rotate-y)));

    aspect-ratio: 1;
    width: 48px;
    padding: 0;

    appearance: none;
    background-image: var(--border), var(--bg);
    background-repeat: no-repeat;
    background-size: cover;
    border: solid 1px var(--primary);

    image-rendering: pixelated;
    &:hover {
      filter: brightness(130%);
    }

    &:first-of-type {
      width: 64px;
    }
  }
}
</style>
