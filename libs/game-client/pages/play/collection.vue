<script setup lang="ts">
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import bg from '../../assets/backgrounds/spire.jpg';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { Nullable } from '@hc/shared';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const ITEMS_PER_PAGE = 10;
const LOADOUT_MAX_SIZE = 6;

const {
  values,
  general,
  initEmpty,
  initFromLoadout,
  canAddUnit,
  isInLoadout,
  toggleUnit,
  save,
  isSaving
} = useLoadoutForm({
  defaultName: computed(() => `My New Loadout ${loadouts.value.length || ''}`),
  maxSize: LOADOUT_MAX_SIZE,
  onSuccess() {
    sidebarView.value = 'list';
  }
});

const {
  factionFilter,
  page,
  pageCount,
  prevPage,
  nextPage,
  displayedUnits,
  sidebarView,
  loadouts,
  isLoadoutsLoading,
  isCollectionLoading
} = useCollection({
  itemsPerPage: ITEMS_PER_PAGE,
  selectedGeneral: general
});

const sortedLoadoutUnits = computed(() =>
  [...(values.value?.unitIds ?? [])]
    .map(id => UNITS[id])
    .concat(general.value ? [general.value] : [])
    .sort((a, b) => {
      if (a.kind === 'GENERAL') return -1;
      if (b.kind === 'GENERAL') return 1;
      return a.summonCost - b.summonCost;
    })
);

const toggleLoadoutCard = (unit: UnitBlueprint) => {
  if (sidebarView.value === 'list') return;
  toggleUnit(unit);
};

const canAddToLoadout = (unitId: string) => {
  if (sidebarView.value === 'list') return false;
  return canAddUnit(unitId);
};

const loadoutToDelete = ref<Nullable<LoadoutDto>>(null);

const editLoadout = (loadout: LoadoutDto) => {
  initFromLoadout(loadout);
  sidebarView.value = 'form';
};
</script>

<template>
  <div v-if="isCollectionLoading || isLoadoutsLoading" class="loader">
    Loading collection page...
  </div>

  <div v-else class="collection-page" :style="{ '--bg': `url(${bg})` }">
    <CollectionDeleteModal v-model:loadout="loadoutToDelete" />
    <CollectionHeader
      v-model:filter="factionFilter"
      :sidebar-view="sidebarView"
      :selected-general="general"
    />

    <section class="card-list">
      <div
        v-for="item in displayedUnits"
        :key="item._id"
        :tabindex="sidebarView === 'form' && !canAddToLoadout(item.unitId) ? -1 : 0"
        class="card"
        :class="{
          used: sidebarView === 'form' && isInLoadout(item.unitId)
        }"
        @click="toggleLoadoutCard(item.unit)"
        @keyup.enter="toggleLoadoutCard(item.unit)"
      >
        <UnitBlueprintCard :unit="item.unit" />
      </div>
    </section>

    <CollectionFooter
      :page="page"
      :page-count="pageCount"
      @prev="prevPage"
      @next="nextPage"
    />

    <section class="sidebar">
      <template v-if="sidebarView === 'form'">
        <form @submit.prevent="save">
          <header>
            <input v-model="values!.name" class="py-3 flex-1" contenteditable />
            {{ values?.unitIds.size }} / {{ LOADOUT_MAX_SIZE }} units
          </header>
          <p v-if="!sortedLoadoutUnits.length" class="text-center p-4">
            First, select a general.
          </p>
          <ul v-if="values" v-auto-animate class="flex-1">
            <li v-for="unit in sortedLoadoutUnits" :key="unit.id">
              <div v-if="unit.kind === 'SOLDIER'" class="cost">
                {{ unit.summonCost }}
              </div>
              <img :src="`/assets/units/${unit.spriteId}-icon.png`" />
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
          <li v-for="loadout in loadouts" :key="loadout._id" class="m-2 relative">
            <LoadoutCard
              :loadout="loadout"
              tabindex="0"
              @click="editLoadout(loadout)"
              @keydown.enter="editLoadout(loadout)"
            />

            <div class="grid absolute right-0 top-0 h-full items-end">
              <UiIconButton
                name="material-symbols:delete-outline"
                class="error-button"
                :style="{
                  '--ui-icon-button-size': 'var(--font-size-4)',
                  '--ui-icon-button-radius': '0'
                }"
                @click="loadoutToDelete = loadout"
              />
            </div>
          </li>
        </ul>
        <p v-if="!loadouts.length" class="py-3 text-center">
          You don't have any loadout yet
        </p>
        <UiButton
          class="primary-button mx-auto"
          left-icon="material-symbols:add"
          @click="
            () => {
              initEmpty();
              sidebarView = 'form';
            }
          "
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
  position: relative;

  width: 100%;
  padding: 0;

  text-align: left;

  transition: 0.3s;
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
../../assets/units{m}
