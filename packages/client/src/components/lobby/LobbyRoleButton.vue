<script setup lang="ts">
import { api } from '@game/api';
import {
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY
} from '@game/api/src/convex/lobby/lobby.constants';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();

const { mutate: changeRole } = useConvexAuthedMutation(api.lobbies.changeRole, {});
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const players = computed(() =>
  lobby.users.filter(u => u.role === LOBBY_USER_ROLES.PLAYER)
);
const myLobbyUser = computed(() => lobby.users.find(u => u._id === me.value?._id));
const isPlayer = computed(() => myLobbyUser.value?.role === LOBBY_USER_ROLES.PLAYER);
</script>

<template>
  <InteractableSounds>
    <UiButton
      v-if="!isPlayer"
      class="ghost-button"
      :disabled="players.length === MAX_PLAYERS_PER_LOBBY"
      left-icon="material-symbols:switch-access-shortcut"
      @click="changeRole({ role: LOBBY_USER_ROLES.PLAYER, lobbyId: lobby._id })"
    >
      Switch to player
    </UiButton>
  </InteractableSounds>
  <InteractableSounds>
    <UiButton
      v-if="isPlayer"
      class="ghost-button switch-to-spectator"
      left-icon="material-symbols:switch-access-shortcut"
      @click="changeRole({ role: LOBBY_USER_ROLES.SPECTATOR, lobbyId: lobby._id })"
    >
      Switch to spectator
    </UiButton>
  </InteractableSounds>
</template>

<style scoped lang="postcss">
.switch-to-spectator:deep(svg) {
  rotate: 180deg;
}
</style>
