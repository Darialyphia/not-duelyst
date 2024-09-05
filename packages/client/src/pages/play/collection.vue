<script setup lang="ts">
import { CARD_KINDS } from '@game/sdk';
import { vIntersectionObserver } from '@vueuse/components';
import { match } from 'ts-pattern';
import { CollectionCard, CollectionSmallCard } from '#components';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const isEditingLoadout = ref(false);

const listMode = ref<'cards' | 'compact'>('cards');
const { isMobile } = useResponsive();
watchEffect(() => {
  if (!isMobile.value) {
    listMode.value = 'cards';
  }
});

const {
  factionFilter,
  textFilter,
  costFilter,
  displayedCards,
  loadouts,
  allCards,
  selectedFormatId,
  selectedFormat,
  isCollectionLoading,
  isLoadoutsLoading
} = useCollection();

const { canAddCard, addCard, general, reset } = useLoadoutFormProvider({
  cards: allCards,
  selectedFormatId,
  format: selectedFormat,
  defaultName: computed(() => `New Deck ${loadouts.value.length || ''}`),
  onSuccess() {
    isEditingLoadout.value = false;
  }
});

watch(isEditingLoadout, editing => {
  if (editing && general.value) {
    factionFilter.value = general.value.faction;
  } else if (!editing) {
    reset();
    factionFilter.value = undefined;
    selectedFormatId.value = undefined;
  }
});

const addCardToLoadout = (opts: Parameters<typeof addCard>[0]) => {
  if (!isEditingLoadout.value) return;
  addCard(opts);
};

const canAddToLoadout = (unitId: string) => {
  if (!isEditingLoadout.value) return false;
  return canAddCard(unitId);
};

const relevantCards = computed(() => {
  if (!isEditingLoadout.value) return displayedCards.value;
  if (!general.value)
    return displayedCards.value.filter(card => card.card.kind === CARD_KINDS.GENERAL);

  return displayedCards.value.filter(
    card => !card.card.faction || card.card.faction === general.value?.faction
  );
});

const visibleCards = ref(new Set<string>());
const onIntersectionObserver =
  (cardId: string) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleCards.value.add(cardId);
      } else {
        visibleCards.value.delete(cardId);
      }
    });
  };

const listRoot = ref<HTMLElement>();
watch(relevantCards, () => {
  listRoot.value?.scrollTo({
    top: 0,
    behavior: 'instant'
  });
});

const collectionItemComponent = computed(() =>
  match(listMode.value)
    .with('cards', () => CollectionCard)
    .with('compact', () => CollectionSmallCard)
    .exhaustive()
);
</script>

<template>
  <div class="collection-page">
    <CollectionHeader
      v-model:filter="factionFilter"
      v-model:search="textFilter"
      v-model:cost="costFilter"
      v-model:list-mode="listMode"
      v-model:selected-format-id="selectedFormatId"
      :general="isEditingLoadout ? general : undefined"
    />

    <section ref="listRoot" class="card-list fancy-scrollbar" :class="listMode">
      <div
        v-if="isCollectionLoading || isLoadoutsLoading"
        class="h-full flex items-center"
      >
        <UiLoader v-if="isCollectionLoading || isLoadoutsLoading" />
      </div>
      <p v-else-if="!relevantCards.length">No card found matching this filter.</p>
      <div
        v-for="item in relevantCards"
        :key="item.cardId"
        v-intersection-observer="[
          onIntersectionObserver(item.cardId),
          { root: listRoot }
        ]"
        class="card-wrapper"
      >
        <Transition>
          <component
            :is="collectionItemComponent"
            v-if="visibleCards.has(item.cardId)"
            :card="item"
            :is-editing-loadout="isEditingLoadout"
            :can-add-to-loadout="canAddToLoadout(item.cardId)"
            @click="
              addCardToLoadout({
                id: item.cardId,
                pedestalId: item.pedestalId,
                cardBackId: item.cardBackId
              })
            "
          />
        </Transition>
      </div>
    </section>

    <CollectionSidebar
      v-if="loadouts"
      v-model:is-editing-loadout="isEditingLoadout"
      class="sidebar"
      :format="selectedFormat"
      :loadouts="loadouts"
    />
    <div v-else class="sidebar" />
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
  filter: blur(15px);
}
</style>

<style scoped lang="postcss">
.collection-page {
  --sidebar-width: var(--size-14);

  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  grid-template-rows: auto 1fr;

  height: 100vh;

  background-color: hsl(220 50% 15% / 0.5);
  backdrop-filter: blur(5px);
  > .loader {
    grid-column: 1 / -1;
  }

  @screen lt-lg {
    --sidebar-width: 15rem;

    grid-template-rows: 1fr;
  }
}

.loader {
  display: grid;
  place-content: center;
}

.card-list {
  /* scroll-snap-type: y mandatory; */
  --min-card-size: 17rem;

  transform-style: preserve-3d;

  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-card-size), 1fr));
  row-gap: var(--size-6);
  column-gap: var(--size-4);
  justify-items: center;

  padding: var(--size-3) var(--size-8) var(--size-11);

  border-radius: var(--radius-2);

  @screen lt-xl {
    column-gap: var(--size-2);
    padding: var(--size-3) var(--size-2) var(--size-11);
  }

  @screen lt-lg {
    column-gap: var(--size-2);
    padding: var(--size-9) 0 var(--size-11) var(--size-6);
    &.compact {
      --min-card-size: 6rem;
    }
  }
}

.card-wrapper {
  transform-style: preserve-3d;
  width: 286px;
  height: 410px;

  @screen lt-lg {
    .cards & {
      width: 260px;
      height: 350px;

      > * {
        transform-origin: top left;
      }
    }
    .compact & {
      width: auto;
      height: 107px;
    }
  }

  @screen lg {
    > * {
      &:is(.v-enter-active, .v-leave-active) {
        transition: all 0.3s;
      }

      &:is(.v-enter-from, .v-leave-to) {
        transform: translateX(-20px);
        opacity: 0.5;
      }
    }
  }
}

.sidebar {
  grid-column: 2;
  grid-row: 1 / -1;
}
</style>
