<script setup lang="ts">
import { api } from '@game/api';
import {
  LOBBY_STATUS,
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY
} from '@game/api/src/convex/lobby/lobby.constants';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const players = computed(() =>
  lobby.users.filter(u => u.role === LOBBY_USER_ROLES.PLAYER)
);
const isOwner = computed(() => lobby.owner._id === me.value._id);

const { mutate: start, isLoading: isStarting } = useConvexAuthedMutation(
  api.lobbies.start
);

const { mutate: leaveLobby, isLoading: isLeaving } = useConvexAuthedMutation(
  api.lobbies.leave,
  {
    onSuccess() {
      navigateTo({ name: 'Lobbies' });
    }
  }
);

const isReady = computed(
  () =>
    players.value.length === MAX_PLAYERS_PER_LOBBY && players.value.every(p => p.loadout)
);
</script>

<template>
  <footer class="flex mt-auto">
    <UiButton
      v-if="isOwner"
      class="primary-button"
      :disabled="!isReady"
      :is-loading="isStarting || lobby.status === LOBBY_STATUS.CREATING_GAME"
      @click="start({ lobbyId: lobby._id })"
    >
      Start game
    </UiButton>
    <UiButton
      :is-loading="isLeaving"
      class="error-button ml-auto"
      @click="leaveLobby({ lobbyId: lobby._id })"
    >
      Leave lobby
    </UiButton>
  </footer>
</template>
