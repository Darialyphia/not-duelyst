<script setup lang="ts">
import { api } from '@hc/api';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import { FACTIONS, UNITS, type UnitBlueprint } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';
import type { Nullable, PartialBy } from '@hc/shared';

definePageMeta({
  name: 'Collection'
});

const { data: collection, isLoading: isCollectionLoading } = useConvexQuery(
  api.collection.myCollection,
  {},
  { ssr: true }
);

const factions: FactionId[] = ['haven', 'chaos', 'neutral'];
const page = ref(0);
const ITEMS_PER_PAGE = 8;
const LOADOUT_MAX_SIZE = 6;

const factionFilter = ref<FactionId>('haven');
const factionIndex = computed(() => factions.indexOf(factionFilter.value));

const filteredUnits = computed(() =>
  collection.value
    ? collection.value
        .map(item => ({ ...item, unit: UNITS[item.unitId] }))
        .filter(({ unit }) => unit.faction.id === factionFilter.value)
        .filter(({ unit }) =>
          sidebarView.value === 'list' || general.value ? true : unit.kind === 'GENERAL'
        )
    : []
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

const { data: loadouts } = useConvexQuery(api.loadout.myLoadouts, {});

const sidebarView = ref<'list' | 'form'>('list');

const loadoutForm = ref<{
  _id?: string;
  name: string;
  generalId: string | null;
  unitIds: Set<string>;
}>();
const general = computed(() =>
  loadoutForm.value?.generalId ? UNITS[loadoutForm.value.generalId] : null
);
const createEmptyLoadout = () => {
  sidebarView.value = 'form';
  loadoutForm.value = {
    generalId: null,
    unitIds: new Set(),
    name: ''
  };
};

const isInLoadout = (unitId: string) => {
  if (UNITS[unitId].kind === 'GENERAL') {
    return !!loadoutForm.value?.generalId;
  }
  return loadoutForm.value?.unitIds.has(unitId);
};

const canAddCardToLoadout = (unitId: string) => {
  if (sidebarView.value === 'list') return false;
  const unit = UNITS[unitId];
  if (!general.value) return unit.kind === 'GENERAL';

  return (
    loadoutForm.value!.unitIds.size < LOADOUT_MAX_SIZE &&
    (unit.faction === FACTIONS.neutral || unit.faction === general.value.faction)
  );
};

const toggleLoadoutCard = (unit: UnitBlueprint) => {
  if (sidebarView.value === 'list') return;
  if (!canAddCardToLoadout(unit.id)) return;

  switch (unit.kind) {
    case 'GENERAL':
      if (isInLoadout(unit.id) && loadoutForm.value?.unitIds.size === 0) {
        loadoutForm.value.generalId = null;
      } else {
        loadoutForm.value!.generalId = unit.id;
      }
      break;
    case 'SOLDIER':
      if (isInLoadout(unit.id)) {
        loadoutForm.value!.unitIds.delete(unit.id);
      } else {
        loadoutForm.value!.unitIds.add(unit.id);
      }
      break;
  }
};

const sortedLoadoutUnits = computed(() =>
  [...(loadoutForm.value?.unitIds ?? [])]
    .map(id => UNITS[id])
    .concat(general.value ? [general.value] : [])
    .sort((a, b) => {
      if (a.kind === 'GENERAL') return -1;
      if (b.kind === 'GENERAL') return 1;
      return a.summonCost - b.summonCost;
    })
);
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
          :class="faction === factionFilter ? 'primary-button' : 'ghost-button'"
          :style="{
            '--d-button-border-size': 'var(--border-size-2)',
            '--d-button-border-color': 'var(--primary)'
          }"
          @click="factionFilter = faction"
        >
          {{ faction }}
        </UiButton>
      </div>
    </header>
    <div v-if="isCollectionLoading" class="loader">Loading...</div>

    <section v-else class="card-list">
      <div
        v-for="item in displayedUnits"
        :key="item._id"
        :tabindex="sidebarView === 'form' && !canAddCardToLoadout(item.unitId) ? -1 : 0"
        class="card"
        :class="{
          disabled: sidebarView === 'form' && !canAddCardToLoadout(item.unitId),
          used: sidebarView === 'form' && isInLoadout(item.unitId)
        }"
        @click="toggleLoadoutCard(item.unit)"
      >
        <UnitBlueprintCard :unit="item.unit" />
      </div>
    </section>

    <section class="sidebar">
      <template v-if="sidebarView === 'form'">
        <div class="flex flex-col h-full">
          <ul v-if="loadoutForm" class="flex-1">
            <li v-for="unit in sortedLoadoutUnits" :key="unit.id" class="p-2 flex gap-2">
              <div v-if="unit.kind === 'SOLDIER'" class="cost">
                {{ unit.summonCost }}
              </div>
              {{ unit.id }}

              <UiButton
                aria-label="remove from loadout"
                class="ml-auto rounded-round error-button p-2"
                @click="toggleLoadoutCard(unit)"
              >
                <Icon name="mdi:minus" />
              </UiButton>
            </li>
          </ul>

          <footer>
            <UiButton
              class="ghost-button"
              left-icon="mdi:undo"
              @click="sidebarView = 'list'"
            >
              Back
            </UiButton>
            <UiButton class="primary-button">Save</UiButton>
          </footer>
        </div>
      </template>

      <template v-else>
        <ul v-if="loadouts">
          <li v-for="loadout in loadouts" :key="loadout._id">{{ loadout.name }}</li>
        </ul>
        <UiButton
          class="primary-button"
          left-icon="material-symbols:add"
          is-cta
          @click="createEmptyLoadout"
        >
          Create new Loadout
        </UiButton>
      </template>
    </section>

    <footer>
      <UiButton class="ghost-button p-0" @click="prevPage">
        <Icon name="ic:baseline-keyboard-arrow-left" size="2em" />
      </UiButton>
      {{ page + 1 }} / {{ pageCount }}
      <UiButton class="ghost-button p-0" @click="nextPage">
        <Icon name="ic:baseline-keyboard-arrow-right" size="2em" />
      </UiButton>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.collection-page {
  display: grid;
  grid-template-columns: 1fr var(--size-sm);
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

  > footer {
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
  overflow: auto;
  display: grid;
  grid-auto-rows: calc(50% - 2 * var(--sizeè2));
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  row-gap: var(--size-3);
  column-gap: var(--size-4);
  justify-items: center;

  padding-block: var(--size-2);

  background-color: var(--surface-3);
}
.card {
  overflow-y: hidden;
  transition: all 0.2s;
  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }
  &.disabled {
    opacity: 0.3;
    filter: grayscale(1);
  }

  &.used {
    opacity: 0.8;
    filter: contrast(120%);
  }

  &:not(.disabled):hover {
    box-shadow: 0 0 1rem 0.5rem hsl(var(--color-primary-hsl) / 0.3);
  }

  > * {
    height: 100%;
  }
}

.sidebar {
  grid-row: span 2;

  footer {
    display: flex;
    gap: var(--size-3);
    justify-content: flex-end;
    padding: var(--size-3) var(--size-4);
  }
}

.cost {
  display: grid;
  place-content: center;

  width: var(--size-6);
  height: var(--size-6);
  padding: var(--size-1);

  color: white;

  background-color: var(--blue-9);
  border-radius: var(--radius-round);
}
</style>
