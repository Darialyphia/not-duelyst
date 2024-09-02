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
  api.lobbies.start,
  {
    onSuccess() {
      console.log('starting game success');
    }
  }
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

const readySound = useSoundEffect('tab_in.m4a');
watchEffect(() => {
  if (!isOwner.value) return;
  if (isReady.value) {
    readySound.play();
  }
});
</script>

<template>
  <footer class="flex mt-auto">
    <LinkSounds>
      <div v-if="isOwner" class="start-wrapper" :class="isReady && 'is-ready'">
        <UiButton
          class="primary-button"
          :disabled="!isReady"
          :is-loading="isStarting || lobby.status === LOBBY_STATUS.CREATING_GAME"
          @click="
            () => {
              console.log('start game');
              start({ lobbyId: lobby._id });
            }
          "
        >
          Start game
        </UiButton>
      </div>
    </LinkSounds>
    <LinkSounds>
      <UiButton
        :is-loading="isLeaving"
        class="error-button ml-auto"
        @click="leaveLobby({ lobbyId: lobby._id })"
      >
        Leave lobby
      </UiButton>
    </LinkSounds>
  </footer>
</template>

<style scoped lang="postcss">
@property --lobby-footer-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes lobby-ready {
  to {
    --lobby-footer-angle: 360deg;
  }
}

.start-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;

  border: 3px solid #0000;
  border-radius: 12px;

  &.is-ready {
    background: linear-gradient(
        var(--lobby-footer-angle),
        transparent,
        var(--primary-dark)
      )
      border-box;
    animation: 4s lobby-ready linear infinite;
  }
}
</style>
