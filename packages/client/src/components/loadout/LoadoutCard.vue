<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS } from '@game/sdk';
import type { CardBlueprintId } from '@game/sdk/src/card/card';

const { loadout } = defineProps<{
  loadout: LoadoutDto;
}>();

const getSpriteId = (cardId: CardBlueprintId) => {
  const card = CARDS[cardId];

  return card.spriteId;
};

const general = computed(() => {
  return loadout.cards.find(c => {
    const card = CARDS[c.id];
    return card.kind === CARD_KINDS.GENERAL;
  })!;
});
</script>

<template>
  <article class="fancy-surface" :class="!loadout.isValid && 'is-invalid'">
    <div class="sprite">
      <CardSprite :sprite-id="getSpriteId(general.id)" />
    </div>
    <div class="space-y-1">
      <span class="font-semibold">{{ loadout.name }}</span>
      <span class="c-text-3 text-00">{{ loadout.format.name }}</span>
    </div>
  </article>
</template>

<style scoped lang="postcss">
article {
  user-select: none;

  overflow: hidden;
  display: flex;
  gap: var(--size-4);
  align-items: center;

  padding: 0;
  padding: var(--size-1) var(--size-2);

  border-top-right-radius: var(--radius-3);
  border-bottom-left-radius: var(--radius-3);

  &.is-invalid {
    border-color: var(--error);
  }
}

span {
  display: block;
  grid-column: 1 / -1;
}

.sprite {
  scale: 2;

  overflow: hidden;

  width: var(--size-8);
  height: var(--size-8);

  /* border: var(--fancy-border); */
  border-radius: var(--radius-round);

  image-rendering: pixelated;

  mask-image: linear-gradient(to right, black, hsl(0 0 0 / 0.25));
  > * {
    transform: translateY(50%);
    height: 100%;
  }
}
</style>
