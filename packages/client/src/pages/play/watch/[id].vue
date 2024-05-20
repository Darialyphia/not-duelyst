<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'WatchGame',
  bgm: BGMS.BATTLE
});

const route = useRoute();

const { data: game } = useConvexQuery(api.games.getById, {
  gameId: route.params.id as Id<'games'>
});
</script>

<template>
  <div class="page">
    <ClientOnly>
      <template #default>
        <SpectatorMode v-if="game" :game="game" />
        <div v-else>Spectator mode</div>
      </template>

      <template #fallback>
        <div />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.page {
  overflow: hidden;
  height: 100dvh;
  background-color: black;
}
</style>
