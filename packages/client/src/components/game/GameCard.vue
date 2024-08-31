<script setup lang="ts">
import type { GameDto } from '@game/api/src/convex/game/game.mapper';
import type { GameLoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS } from '@game/sdk';
import type { RouteLocationNamedRaw } from 'vue-router';

const { game, link } = defineProps<{ game: GameDto; link: RouteLocationNamedRaw }>();

const getGeneralSpriteIds = (loadout: GameLoadoutDto) => {
  const { spriteId, pedestalId } = loadout.cards
    .map(c => ({ ...CARDS[c.id], pedestalId: c.pedestalId }))
    .find(c => {
      return c.kind === CARD_KINDS.GENERAL;
    })!;

  return { spriteId, pedestalId };
};
</script>

<template>
  <article>
    <div class="flex-1 flex gap-4 items-center">
      <CardSprite v-bind="getGeneralSpriteIds(game.players[0]!.loadout)" class="sprite" />

      {{ game.players[0].name }}

      <span class="mx-auto">VS</span>

      {{ game.players[1].name }}
      <CardSprite v-bind="getGeneralSpriteIds(game.players[1]!.loadout)" class="sprite" />
    </div>
    <NuxtLink v-slot="{ navigate, href }" :to="link" custom>
      <UiButton class="primary-button" :href="href" @click="navigate">Watch</UiButton>
    </NuxtLink>
    <div class="w-full text-0">{{ $dayjs(game.startedAt).fromNow() }}</div>
  </article>
</template>

<style scoped lang="postcss">
article {
  display: flex;
  flex-wrap: wrap;
  column-gap: var(--size-8);
  align-items: center;

  padding: var(--size-3);

  font-size: var(--font-size-3);

  background-color: hsl(0 0% 0% / 0.3);
  backdrop-filter: blur(5px);
  border: solid var(--border-size-1) var(--border-dimmed);

  span {
    font-size: var(--font-size-5);
    font-weight: var(--font-weight-6);
  }
}

.sprite {
  aspect-ratio: 1;
  width: 64px;
}
</style>
