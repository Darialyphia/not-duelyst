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
  <article class="fancy-surface">
    <div class="sprite">
      <CardSprite :sprite-id="getSpriteId(general.id)" />
    </div>
    <div class="grid grid-cols-6 gap-1">
      <span>{{ loadout.name }}</span>
      <!-- <div v-for="card in minions" :key="card.id" class="sprite">
        <CardSprite :sprite-id="getSpriteId(card.id)" />
      </div> -->
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

.sprite {
  overflow: hidden;

  width: var(--size-8);
  height: var(--size-8);

  border: var(--fancy-border);
  border-radius: var(--radius-round);

  image-rendering: pixelated;

  > * {
    transform: translateY(50%);
    height: 100%;
  }
}
</style>
