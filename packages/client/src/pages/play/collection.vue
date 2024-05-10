<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import type { CardBlueprint } from '@game/sdk';
import type { Nullable } from '@game/shared';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const sidebarView = ref<'list' | 'form'>('list');
const {
  formValues,
  initEmpty,
  initFromLoadout,
  canAddUnit,
  isInLoadout,
  toggleUnit,
  save,
  isSaving
} = useLoadoutForm({
  defaultName: computed(() => `My New Loadout ${loadouts.value.length || ''}`),
  onSuccess() {
    sidebarView.value = 'list';
  }
});

const {
  factionFilter,
  displayedCards,
  loadouts,
  isLoadoutsLoading,
  isCollectionLoading
} = useCollection();

const toggleLoadoutCard = (card: CardBlueprint) => {
  if (sidebarView.value === 'list') return;
  toggleUnit(card.id);
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

  <div v-else class="collection-page">
    <CollectionDeleteModal v-model:loadout="loadoutToDelete" />
    <CollectionHeader v-model:filter="factionFilter" />

    <ClientOnly>
      <template #fallback>Loading Collection...</template>

      <Collection
        :cards="displayedCards"
        :is-in-loadout="isInLoadout"
        :can-add-to-loadout="canAddToLoadout"
        :is-editing="sidebarView === 'form'"
        @toggle="toggleLoadoutCard($event)"
      >
        <template #sidebar>
          <template v-if="sidebarView === 'form'">
            <LoadoutForm
              v-if="formValues"
              v-model:name="formValues.name"
              :cards="formValues.cards"
              :is-saving="isSaving"
              @back="sidebarView = 'list'"
              @save="save"
              @toggle-unit="toggleLoadoutCard($event)"
              @set-pedestal="
                ({ id, pedestalId }) => {
                  formValues!.cards.find(c => c.id === id)!.pedestalId = pedestalId;
                }
              "
            />
          </template>

          <template v-else>
            <ul v-if="loadouts" v-auto-animate>
              <li v-for="loadout in loadouts" :key="loadout._id" class="m-2 relative">
                <CollectionLoadoutCard
                  :loadout="loadout"
                  @edit="editLoadout(loadout)"
                  @delete="loadoutToDelete = loadout"
                />
              </li>
            </ul>

            <p v-if="!loadouts.length" class="py-3 text-center">
              You don't have any loadout yet
            </p>

            <UiFancyButton
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
            </UiFancyButton>
          </template>
        </template>
      </Collection>
    </ClientOnly>
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

  .sidebar {
    transform: translateX(100%);
  }
}
</style>

<style scoped lang="postcss">
.collection-page {
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr var(--size-xs);
  grid-template-rows: auto 1fr auto;

  height: 100vh;

  > .loader {
    grid-column: 1 / -1;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
