<script setup lang="ts">
import { api } from '@hc/api';

definePageMeta({
  name: 'MyProfile'
});

const { data: me } = useConvexAuthedQuery(api.users.me, {});
const { data: gameHistory, isLoading: isLoadingHistory } = useConvexAuthedQuery(
  api.games.getMyGameHistory,
  {},
  { ssr: false }
);

const getOpponent = (game: (typeof gameHistory)['value'][number]) => {
  return game.players.find(p => p._id !== me.value?._id);
};

const getResult = (game: (typeof gameHistory)['value'][number]) =>
  getOpponent(game)?.gamePlayerId === game.winnerId ? 'LOSS' : 'WIN';
</script>

<template>
  <div v-if="!me">Loading profile...</div>

  <div v-else>
    <div class="container">
      <h2>Game History</h2>

      <div v-if="isLoadingHistory">Loading history...</div>
      <ul v-if="gameHistory">
        <li v-for="game in gameHistory" :key="game._id" class="flex gap-3 items-center">
          <span class="font-600">{{ getResult(game) }}</span>
          VS {{ getOpponent(game)?.fullName }}

          <NuxtLink
            v-slot="{ href, navigate }"
            custom
            :to="{ name: 'Replay', params: { id: game._id } }"
          >
            <UiButton :href="href" class="primary-button" @click="navigate">
              Watch Replay
            </UiButton>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
