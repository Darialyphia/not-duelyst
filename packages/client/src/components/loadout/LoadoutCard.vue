<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS } from '@game/sdk';
import type { CardBlueprintId } from '@game/sdk/src/card/card';

const { loadout } = defineProps<{
  loadout: LoadoutDto;
}>();

const getImage = (cardId: CardBlueprintId) => {
  const unit = CARDS[cardId];

  return `/assets/units/${unit.spriteId}-icon.png`;
};

const general = computed(() => {
  return loadout.cards.find(c => {
    const card = CARDS[c.id];
    return card.kind === CARD_KINDS.GENERAL;
  });
});

const generalImage = computed(() => {
  if (!general.value) return null;
  return getImage(general.value.id);
});
</script>

<template>
  <article class="fancy-surface">
    <div class="general">
      <img v-if="generalImage" :src="generalImage" />
    </div>
    <div class="grid grid-cols-6 gap-1">
      <span>{{ loadout.name }}</span>
      <img v-for="card in loadout.cards" :key="card.id" :src="getImage(card.id)" />
    </div>
  </article>
</template>

<style scoped lang="postcss">
article {
  user-select: none;

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: 0;
  padding: var(--size-1) var(--size-2);

  border-top-right-radius: var(--radius-3);
  border-bottom-left-radius: var(--radius-3);
}

span {
  display: block;
  grid-column: 1 / -1;
}

img {
  overflow: hidden;

  aspect-ratio: 1;
  width: var(--size-7);

  border: var(--fancy-border);
  border-radius: var(--radius-round);

  image-rendering: pixelated;
}

.general {
  position: relative;
  align-self: start;
  > img {
    width: var(--size-9);
  }

  > div {
    position: absolute;
    bottom: 0;

    display: flex;
    justify-content: space-around;

    width: 100%;
    > img {
      width: 16px;
      height: 18px;
    }
  }
}
</style>
