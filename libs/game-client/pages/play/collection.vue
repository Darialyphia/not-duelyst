<script setup lang="ts">
import { api } from '@hc/api';
import { FACTIONS, UNITS, type UnitBlueprint } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';
import { unitImagesPaths } from '../../assets/units';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import bg from '../../assets/backgrounds/spire.jpg';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
  api.collection.myCollection,
  {}
);

const factions: FactionId[] = ['haven', 'chaos', 'neutral'];
const page = ref(0);
const ITEMS_PER_PAGE = 10;
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
        .sort((a, b) => {
          const factionDiff =
            factions.indexOf(b.unit.faction.id) - factions.indexOf(a.unit.faction.id);
          if (factionDiff !== 0) return factionDiff;
          return a.unit.summonCost - b.unit.summonCost;
        })
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

const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);

const sidebarView = ref<'list' | 'form'>('list');

const loadoutForm = ref<{
  loadoutId?: Id<'loadouts'>;
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
    name: `My New Loadout ${loadouts.value.length || ''}`
  };
};

const selectLoadout = (loadout: LoadoutDto) => {
  sidebarView.value = 'form';
  factionFilter.value = UNITS[loadout.generalId].faction.id;
  loadoutForm.value = {
    loadoutId: loadout._id,
    generalId: loadout.generalId,
    unitIds: new Set(loadout.unitIds),
    name: loadout.name
  };
};

const isInLoadout = (unitId: string) => {
  if (UNITS[unitId].kind === 'GENERAL') {
    return loadoutForm.value?.generalId === unitId;
  }
  return loadoutForm.value?.unitIds.has(unitId);
};

const canAddCardToLoadout = (unitId: string) => {
  if (sidebarView.value === 'list') return false;
  const unit = UNITS[unitId];
  if (!general.value) return unit.kind === 'GENERAL';

  return unit.faction === FACTIONS.neutral || unit.faction === general.value.faction;
};

const loadoutIsFull = computed(() => loadoutForm.value!.unitIds.size >= LOADOUT_MAX_SIZE);

const toggleLoadoutCard = (unit: UnitBlueprint) => {
  if (sidebarView.value === 'list') return;
  if (!canAddCardToLoadout(unit.id)) return;

  switch (unit.kind) {
    case 'GENERAL':
      if (isInLoadout(unit.id)) {
        if (loadoutForm.value?.unitIds.size === 0) {
          loadoutForm.value.generalId = null;
        }
      } else {
        loadoutForm.value!.generalId = unit.id;
      }
      break;
    case 'SOLDIER':
      if (isInLoadout(unit.id)) {
        loadoutForm.value!.unitIds.delete(unit.id);
      } else if (!loadoutIsFull.value) {
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

const { mutate: saveNewDeck, isLoading: isSavingNewDeck } = useConvexAuthedMutation(
  api.loadout.create,
  {
    onSuccess() {
      sidebarView.value = 'list';
    }
  }
);
const { mutate: updateDeck, isLoading: isUpdatingDeck } = useConvexAuthedMutation(
  api.loadout.update,
  {
    onSuccess() {
      sidebarView.value = 'list';
    }
  }
);

const isSaving = computed(() => isSavingNewDeck.value || isUpdatingDeck.value);

const onSubmit = () => {
  if (!loadoutForm.value) return;
  if (loadoutForm.value.loadoutId) {
    updateDeck({
      loadoutId: loadoutForm.value.loadoutId,
      name: loadoutForm.value!.name,
      generalId: loadoutForm.value.generalId!,
      units: [...loadoutForm.value.unitIds]
    });
  } else {
    saveNewDeck({
      name: loadoutForm.value!.name,
      generalId: loadoutForm.value.generalId!,
      units: [...loadoutForm.value.unitIds]
    });
  }
};

const getGeneralImage = (generalId: string) => {
  const unit = UNITS[generalId];
  return unitImagesPaths[`${unit.spriteId}-icon`];
};
</script>

<template>
  <div v-if="isCollectionLoading || isLoadoutsLoading" class="loader">
    Loading collection page...
  </div>

  <div v-else class="collection-page" :style="{ '--bg': `url(${bg})` }">
    <header class="fancy-surface border-none">
      <BackButton class="flex-self-center" />
      <div class="flex gap-2">
        <UiButton
          v-for="faction in factions"
          :key="faction"
          class="capitalize"
          :class="faction === factionFilter ? 'primary-button' : 'ghost-button'"
          @click="factionFilter = faction"
        >
          {{ faction }}
        </UiButton>
      </div>
    </header>

    <section class="card-list">
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
        @keyup.enter="toggleLoadoutCard(item.unit)"
      >
        <UnitBlueprintCard :unit="item.unit" />
      </div>
    </section>

    <footer class="fancy-surface border-none">
      <UiButton class="ghost-button p-0" @click="prevPage">
        <Icon name="ic:baseline-keyboard-arrow-left" size="2em" />
      </UiButton>
      {{ page + 1 }} / {{ pageCount }}
      <UiButton class="ghost-button p-0" @click="nextPage">
        <Icon name="ic:baseline-keyboard-arrow-right" size="2em" />
      </UiButton>
    </footer>

    <section class="sidebar">
      <template v-if="sidebarView === 'form'">
        <form @submit.prevent="onSubmit">
          <header>
            <input v-model="loadoutForm!.name" class="py-3 flex-1" contenteditable />
            {{ loadoutForm?.unitIds.size }} / {{ LOADOUT_MAX_SIZE }} units
          </header>
          <p v-if="!sortedLoadoutUnits.length" class="text-center p-4">
            First, select a general.
          </p>
          <ul v-if="loadoutForm" v-auto-animate class="flex-1">
            <li v-for="unit in sortedLoadoutUnits" :key="unit.id">
              <div v-if="unit.kind === 'SOLDIER'" class="cost">
                {{ unit.summonCost }}
              </div>
              <img :src="unitImagesPaths[`${unit.spriteId}-icon`]" />
              {{ unit.id }}

              <UiButton
                aria-label="remove from loadout"
                class="error-button"
                type="button"
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
              type="button"
              :is-loading="isSaving"
              @click="sidebarView = 'list'"
            >
              Back
            </UiButton>
            <UiButton class="primary-button" :is-loading="isSaving">Save</UiButton>
          </footer>
        </form>
      </template>

      <template v-else>
        <ul v-if="loadouts" v-auto-animate>
          <li
            v-for="loadout in loadouts"
            :key="loadout._id"
            class="p-2 border-primary border-1 m-2"
          >
            <button
              class="loadout"
              :style="{ '--bg': `url(${getGeneralImage(loadout.generalId)}` }"
              @click="selectLoadout(loadout)"
            >
              {{ loadout.name }}
            </button>
          </li>
        </ul>
        <p v-if="!loadouts.length" class="py-3 text-center">
          You don't have any loadout yet
        </p>
        <UiButton
          class="primary-button mx-auto"
          left-icon="material-symbols:add"
          @click="createEmptyLoadout"
        >
          Create new Loadout
        </UiButton>
      </template>
    </section>
  </div>
</template>

<style lang="postcss">
.collection-enter-active,
.collection-leave-active {
  transition: all 0.4s;
}
.collection-enter-from,
.collection-leave-to {
  opacity: 0;
  filter: blur(5px);
}
</style>

<style scoped lang="postcss">
.collection-page {
  display: grid;
  grid-template-columns: 1fr var(--size-xs);
  grid-template-rows: auto 1fr auto;

  height: 100vh;

  background: var(--bg);
  background-color: var(--surface-3);
  background-repeat: no-repeat;
  background-size: cover;

  > .loader {
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
  grid-auto-rows: calc(50% - 2 * var(--size-2));
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  row-gap: var(--size-3);
  column-gap: var(--size-4);
  justify-items: center;

  padding-block-start: var(--size-2);
  padding-inline: var(--size-2);

  background: var(--fancy-bg-transparency);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-2);
  box-shadow: inset 0 0 5rem 1rem hsl(0 0% 100% / 0.2);
}

.card {
  overflow-y: hidden;
  transition: all 0.2s;
  > * {
    height: 100%;
  }
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
    outline: solid var(--border-size-2) var(--primary);
  }

  &:not(.disabled):hover {
    box-shadow: 0 0 1rem 0.5rem hsl(var(--color-primary-hsl) / 0.3);
  }
}

.loadout {
  --mask: linear-gradient(to right, hsl(0 0% 0% / 0.75), transparent 25%);

  position: relative;

  width: 100%;
  padding: var(--size-3);
  padding-left: calc(64px + var(--size-2));

  text-align: left;

  transition: 0.3s;
  &::after {
    content: '';

    position: absolute;
    inset: 0;

    background-image: var(--bg);
    background-repeat: no-repeat;
    background-position: left;

    mask-image: var(--mask);
  }

  &:hover {
    --mask: linear-gradient(to right, black, transparent 35%);

    filter: brightness(125%) contrast(125%);
  }
}

.sidebar {
  grid-column: 2;
  grid-row: 1 / -1;

  background: var(--fancy-bg);
  background-blend-mode: overlay;
  border-left: var(--fancy-border);

  footer {
    display: flex;
    gap: var(--size-3);
    justify-content: flex-end;
    padding-block: var(--size-3);
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

form {
  display: flex;
  flex-direction: column;

  height: 100%;
  padding-top: var(--size-5);
  padding-right: var(--size-3);
  padding-left: var(--size-3);

  > header {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    justify-content: space-between;
  }

  li {
    display: flex;
    gap: var(--size-2);
    align-items: center;

    padding-block: var(--size-2);

    border-bottom: solid var(--border-size-1) var(--border-dimmed);
    > img {
      overflow: hidden;

      aspect-ratio: 1;
      width: 32px;

      border: solid var(--border-size-1) var(--primary);
      border-radius: var(--radius-round);
    }

    > button {
      margin-left: auto;
      padding: var(--size-1);
      font-size: var(--font-size-0);
      border-radius: var(--radius-round);
    }
  }
}
</style>
