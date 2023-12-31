<script setup lang="ts">
import { api } from '@hc/api';

definePageMeta({
  name: 'WatchList'
});

const { data: games, isLoading } = useConvexAuthedQuery(api.games.getAllOngoing, {});
</script>

<template>
  <div v-if="isLoading">Loading games...</div>
  <ul v-else-if="games">
    <li v-for="game in games" :key="game._id">
      <NuxtLink :to="{ name: 'WatchGame', params: { id: game._id } }">
        {{ game.players[0].name }} VS {{ game.players[1].name }}
      </NuxtLink>
    </li>
  </ul>
</template>
