<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'WatchList'
});

const { data: games, isLoading } = useConvexAuthedQuery(api.games.getAllOngoing, {});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading games...</div>
    <ClientOnly v-else>
      <div>
        <OngoingGamesList :games="games" />
      </div>

      <template #fallback>
        <div />
      </template>
    </ClientOnly>
  </div>
</template>
