<script setup lang="ts">
import { api } from '@game/api';
import type { GameDto } from '@game/api/src/convex/game/game.mapper';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS } from '@game/sdk';

const { games } = defineProps<{ games: GameDto[] }>();

const getGeneralSpriteIds = (loadout: LoadoutDto) => {
  const { spriteId, pedestalId } = loadout.cards
    .map(c => ({ ...CARDS[c.id], pedestalId: c.pedestalId }))
    .find(c => {
      return c.kind === CARD_KINDS.GENERAL;
    })!;

  return { spriteId, pedestalId };
};

const assets = useAssetsProvider();
assets.load();
</script>

<template>
  <div v-if="!assets.loaded.value" class="fancy-surface">Loading games...</div>
  <div v-else class="fancy-surface">
    <p v-if="!games.length">
      There are no ongoing game at the moment. Check back later !
    </p>

    <article v-for="game in games" :key="game._id">
      <div class="flex-1 flex gap-4 items-center">
        <CardSprite v-bind="getGeneralSpriteIds(game.players[0]!.loadout)" />

        {{ game.players[0].name }}

        <span class="mx-auto">VS</span>

        {{ game.players[1].name }}
        <CardSprite v-bind="getGeneralSpriteIds(game.players[1]!.loadout)" />
      </div>
      <NuxtLink
        v-slot="{ navigate, href }"
        :to="{
          name: 'WatchGame',
          params: { id: game._id },
          query: { roomId: game.roomId }
        }"
        custom
      >
        <UiButton class="primary-button" :href="href" @click="navigate">Watch</UiButton>
      </NuxtLink>
      <div class="w-full text-0">Started 1min ago</div>
    </article>
  </div>
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
  border: var(--fancy-border);

  span {
    font-size: var(--font-size-5);
    font-weight: var(--font-weight-6);
  }

  img {
    overflow: hidden;
    border: var(--fancy-border);
    border-radius: var(--radius-round);
  }
}
</style>
