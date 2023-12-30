<script setup lang="ts">
import { api } from '@hc/api';
import { UNITS } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';

definePageMeta({
  name: 'Collection'
});

const { data: collection, isLoading } = useConvexQuery(
  api.collection.myCollection,
  {},
  { ssr: true }
);

const factions: FactionId[] = ['haven', 'chaos', 'neutral'];
const page = ref(0);
const ITEMS_PER_PAGE = 8;

const factionFilter = ref<FactionId>('haven');
const factionIndex = computed(() => factions.indexOf(factionFilter.value));

const filteredUnits = computed(() =>
  collection.value
    .map(item => ({ ...item, unit: UNITS[item.unitId] }))
    .filter(({ unit }) => unit.faction.id === factionFilter.value)
);
const displayedUnits = computed(() =>
  filteredUnits.value.slice(
    page.value * ITEMS_PER_PAGE,
    page.value * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )
);

const pageCount = computed(() => Math.ceil(filteredUnits.value.length / ITEMS_PER_PAGE));

const prevPage = () => {
  if (page.value > 0) {
    page.value--;
  } else {
    const newIndex =
      factionIndex.value === 0 ? factions.length - 1 : factionIndex.value - 1;
    factionFilter.value = factions[newIndex];
    nextTick(() => {
      page.value = pageCount.value - 1;
    });
  }
};

const nextPage = () => {
  if (page.value < pageCount.value - 1) {
    page.value++;
  } else {
    const newIndex =
      factionIndex.value === factions.length - 1 ? 0 : factionIndex.value + 1;
    factionFilter.value = factions[newIndex];
    page.value = 0;
  }
};
</script>

<template>
  <div class="collection-page">
    <header>
      <NuxtLink :to="{ name: 'ClientHome' }" class="flex gap-1 items-center">
        <span class="i-material-symbols-arrow-back-rounded w-5 h-5 block" />
        Go Back
      </NuxtLink>

      <div class="flex gap-2">
        <UiButton
          v-for="faction in factions"
          :key="faction"
          class="capitalize"
          :style="{
            '--d-button-bg': faction == factionFilter ? 'var(--primary)' : undefined,
            '--d-button-color':
              faction == factionFilter ? 'var(--text-on-primary)' : undefined,
            '--d-button-border-size': 'var(--border-size-2)',
            '--d-button-border-color': 'var(--primary)'
          }"
          @click="factionFilter = faction"
        >
          {{ faction }}
        </UiButton>
      </div>
    </header>
    <div v-if="isLoading" class="loader">loading...</div>
    <section v-else class="card-list">
      <div v-for="item in displayedUnits" :key="item._id" class="card">
        <UnitBlueprintCard :unit="item.unit" />
      </div>
    </section>

    <section class="sidebar">My loadouts</section>
    <footer>
      <UiButton @click="prevPage">Prev</UiButton>
      {{ page + 1 }} / {{ pageCount }}
      <UiButton @click="nextPage">Next</UiButton>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.collection-page {
  display: grid;
  grid-template-columns: var(--size-xl) auto;
  grid-template-rows: auto 1fr auto;
  height: 100vh;

  > :is(header, .loader) {
    grid-column: 1 / -1;
  }

  > header {
    display: flex;
    gap: var(--size-8);
    padding: var(--size-3) var(--size-6);
  }

  footer {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    justify-content: center;

    padding: var(--size-2);
  }
}

.loader {
  display: grid;
  place-content: center;
}
.card-list {
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  grid-template-rows: 1fr 1fr;
  row-gap: var(--size-3);
  column-gap: var(--size-4);
  justify-items: center;
}
.card {
  overflow-y: hidden;
  > * {
    height: 100%;
  }
}

.sidebar {
  grid-row: span 2;
}
</style>
