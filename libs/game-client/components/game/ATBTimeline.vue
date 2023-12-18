<script setup lang="ts">
import { unitImagesPaths } from '../../assets/units';
import havenBorder from '../../assets/ui/icon-border-haven.png';

const { state, gameSession } = useGame();
const { selectedEntity } = useGameUi();
const timeline = computed(() => gameSession.atb.getTimeline(state.value.entities, 10));

const scrollableRef = ref<HTMLElement>();
watch(
  () => state.value.activeEntity.id,
  () => {
    if (!scrollableRef.value) return;
    scrollableRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
);
</script>

<template>
  <div class="timeline content-surface">
    <div ref="scrollableRef" class="flex flex-col gap-3 items-center">
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
  </div>
</template>

<style scoped lang="postcss">
.timeline {
  padding: var(--size-2);
  border-radius: var(--radius-3);

  > div {
    overflow-y: auto;
    max-height: var(--size-sm);

    &::-webkit-scrollbar {
      display: none;
    }
  }
  button {
    all: initial;

    transform-origin: 50% 50%;
    transform: rotateY(calc(1deg * var(--rotate-y)));

    flex-shrink: 0;

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
