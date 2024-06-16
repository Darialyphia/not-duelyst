<script setup lang="ts">
import { CARD_KINDS, CARDS } from '@game/sdk';

const { loadout } = defineProps<{
  loadout: Array<{ id: string; pedestalId: string }>;
}>();

const cards = computed(() =>
  loadout.map(c => CARDS[c.id]).filter(c => c.kind !== CARD_KINDS.GENERAL)
);

const averageGoldCost = computed(() =>
  cards.value.length
    ? cards.value.reduce((total, card) => {
        return total + card.cost;
      }, 0) / cards.value.length
    : 0
);

const averageRuneCost = computed(() =>
  cards.value.length
    ? cards.value.reduce((total, card) => {
        return (
          total +
          Object.values(card.factions).reduce((runes, faction) => runes + faction, 0)
        );
      }, 0) / cards.value.length
    : 0
);

const getCountForCost = (cost: number) => cards.value.filter(c => c.cost === cost).length;
</script>

<template>
  <div class="loadout-stats">
    <div class="flex justify-between mb-3">
      <div class="average">
        Average Gold:
        <span>{{ averageGoldCost.toFixed(1) }}</span>
      </div>
      <div class="average">
        Average Runes:
        <span>{{ averageRuneCost.toFixed(1) }}</span>
      </div>
    </div>

    <div class="bars" :style="{ '--total': cards.length }">
      <div v-for="i in 9" :key="i" :style="{ '--count': getCountForCost(i - 1) }">
        <div class="bar" :data-count="getCountForCost(i - 1)"></div>
        <div class="cost">{{ i - 1 }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.loadout-stats {
  padding: var(--size-2);
}

.average {
  font-size: var(--font-size-0);
  > span {
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-5);
    color: var(--primary);
  }
}

.bars {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: var(--size-1);
  height: var(--size-10);

  > div {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: var(--size-1);
  }
}

.cost {
  display: grid;
  place-content: center;
  color: var(--primary);
}

.bar {
  --percent: calc(1% * (var(--count) * 100 / var(--total)));

  position: relative;
  background: linear-gradient(
    to top,
    var(--primary) 0%,
    var(--primary) var(--percent),
    hsl(var(--gray-12-hsl) / 0.5) var(--percent)
  );

  &:not([data-count='0'])::after {
    content: attr(data-count);

    position: absolute;
    bottom: var(--percent);
    left: 50%;
    transform: translateX(-50%);

    font-size: var(--font-size-0);
  }
}
</style>
