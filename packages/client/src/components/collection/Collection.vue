<script setup lang="ts">
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { CardBlueprint } from '@game/sdk';
import type { CardBlueprintId } from '@game/sdk/src/card/card';

const { cards, isInLoadout, canAddToLoadout, isEditing } = defineProps<{
  cards: Array<{
    card: CardBlueprint;
    cardId: CardBlueprintId;
    _id: Id<'collectionItems'>;
  }>;
  isInLoadout: (id: CardBlueprintId) => boolean | undefined;
  canAddToLoadout: (id: CardBlueprintId) => boolean;
  isEditing: boolean;
}>();
const emit = defineEmits<{
  toggle: [card: CardBlueprint];
}>();

const assets = useAssetsProvider();
assets.load();
</script>

<template>
  <section v-if="assets.loaded.value" class="card-list fancy-scrollbar pb-5">
    <CollectionCard
      v-for="item in cards"
      :key="item._id"
      :card="item"
      :is-in-loadout="!!isInLoadout(item.cardId)"
      :is-editing-loadout="isEditing"
      :can-add-to-loadout="canAddToLoadout(item.cardId)"
      @click="emit('toggle', item.card)"
    />
  </section>

  <section class="sidebar">
    <slot v-if="assets.loaded.value" name="sidebar" />
  </section>
</template>

<style scoped lang="postcss">
.card-list {
  scroll-snap-type: y mandatory;

  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  grid-auto-rows: calc(50% - 2 * var(--size-2));
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  row-gap: var(--size-6);
  column-gap: var(--size-4);
  justify-items: center;

  padding-block-start: var(--size-3);
  padding-inline: var(--size-4);

  border-radius: var(--radius-2);

  > * {
    scroll-margin-block-start: var(--size-4);
    scroll-snap-align: start;
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
}
</style>
