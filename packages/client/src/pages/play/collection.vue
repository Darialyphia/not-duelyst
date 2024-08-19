<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS } from '@game/sdk';
import type { Nullable } from '@game/shared';
import { vIntersectionObserver } from '@vueuse/components';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const mode = ref<'list' | 'form'>('list');
const { factionFilter, textFilter, costFilter, displayedCards, loadouts, collection } =
  useCollection();

const { initEmpty, initFromLoadout, initFromCode, canAddCard, addCard, general } =
  useLoadoutFormProvider({
    collection,
    defaultName: computed(() => `New Deck ${loadouts.value.length || ''}`),
    onSuccess() {
      mode.value = 'list';
    }
  });

watch(mode, () => {
  factionFilter.value = undefined;
});

const addCardToLoadout = (opts: Parameters<typeof addCard>[0]) => {
  if (mode.value === 'list') return;
  addCard(opts);
};

const canAddToLoadout = (unitId: string) => {
  if (mode.value === 'list') return false;
  return canAddCard(unitId);
};

const loadoutToDelete = ref<Nullable<LoadoutDto>>(null);

const editLoadout = (loadout: LoadoutDto) => {
  initFromLoadout(loadout);
  mode.value = 'form';
};

const relevantCards = computed(() => {
  if (mode.value === 'list') return displayedCards.value;
  if (!general.value)
    return displayedCards.value.filter(card => card.card.kind === CARD_KINDS.GENERAL);

  return displayedCards.value.filter(
    card => !card.card.faction || card.card.faction === general.value?.faction
  );
});

const visibleCards = ref(new Set<string>());
const onIntersectionObserver =
  (sprite: string) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleCards.value.add(sprite);
      } else {
        visibleCards.value.delete(sprite);
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
</script>

<template>
  <div class="collection-page">
    <CollectionDeleteModal v-model:loadout="loadoutToDelete" />
    <CollectionHeader
      v-model:filter="factionFilter"
      v-model:search="textFilter"
      v-model:cost="costFilter"
      :general="mode === 'form' ? general : undefined"
    />

    <section ref="listRoot" class="card-list fancy-scrollbar">
      <p v-if="!relevantCards.length">No card found matching this filter.</p>
      <div
        v-for="item in relevantCards"
        :key="item._id"
        v-intersection-observer="[onIntersectionObserver(item._id), { root: listRoot }]"
        class="card-wrapper"
      >
        <Transition>
          <CollectionCard
            v-if="visibleCards.has(item._id)"
            :card="item"
            :is-editing-loadout="mode === 'form'"
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
    <section class="sidebar">
      <template v-if="mode === 'form'">
        <LoadoutForm @back="mode = 'list'" @import-code="initFromCode" />
      </template>

      <template v-else>
        <p v-if="!loadouts?.length" class="py-3 text-center">
          You don't have any loadout yet
        </p>

        <ul v-if="loadouts" v-auto-animate>
          <Sound
            v-for="loadout in loadouts"
            :key="loadout._id"
            sound="button-hover"
            :triggers="['mouseenter']"
          >
            <li class="m-2 relative">
              <CollectionLoadoutCard
                :loadout="loadout"
                @edit="editLoadout(loadout)"
                @delete="loadoutToDelete = loadout"
              />
            </li>
          </Sound>
        </ul>

        <UiFancyButton
          class="primary-button mx-auto"
          left-icon="material-symbols:add"
          @click="
            () => {
              initEmpty();
              mode = 'form';
            }
          "
        >
          New Deck
        </UiFancyButton>
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
  filter: blur(15px);

  /* .sidebar {
    transform: translateX(100%);
  } */
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

  backdrop-filter: blur(5px) brightness(50%);
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
    --min-card-size: 8.5rem;

    column-gap: var(--size-2);
    padding: var(--size-9) 0 var(--size-11) var(--size-6);
  }
}

.sidebar {
  will-change: transform;

  grid-column: 2;
  grid-row: 1 / -1;

  background: var(--fancy-bg);
  background-blend-mode: overlay;
  border-left: var(--fancy-border);

  transition: transform 0.7s;
  transition-delay: 0.3s;
  transition-timing-function: var(--ease-bounce-1);

  @screen lt-lg {
    overflow-x: hidden;
    height: 100dvh;
  }
}

.card-wrapper {
  transform-style: preserve-3d;
  width: 286px;
  height: 410px;

  @screen lt-lg {
    width: 130px;
    height: 186px;

    > * {
      transform-origin: top left;
      transform: scale(0.5);
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
</style>
