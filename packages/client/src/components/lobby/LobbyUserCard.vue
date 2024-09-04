<script setup lang="ts">
import { api } from '@game/api';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobbyUser, lobby } = defineProps<{
  lobby: LobbyDetailsDto;
  lobbyUser: LobbyDetailsDto['users'][number];
}>();

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const isMe = computed(() => me.value._id === lobbyUser._id);
const isOwner = computed(() => lobby.owner._id === lobbyUser._id);
const { data: loadouts } = useConvexAuthedQuery(api.loadout.myLoadouts, {});
const { mutate: selectLoadout } = useConvexAuthedMutation(api.lobbies.chooseLoadout);

const selectedLoadout = computed(() =>
  loadouts.value?.find(l => l._id === lobbyUser.loadout?._id)
);

const isLoadoutDrawerOpened = ref(false);
</script>

<template>
  <li class="lobby-user" :class="lobbyUser.presence">
    <Icon :class="!isOwner && 'opacity-0'" name="mdi:crown" class="c-primary" />
    <img :src="lobbyUser.avatar" width="32" />
    <Icon v-if="lobbyUser.loadout" name="material-symbols:check" class="c-green-6" />
    {{ lobbyUser.name }}

    <template v-if="isMe">
      <template v-if="selectedLoadout">
        <InteractableSounds>
          <button class="w-full">
            <LoadoutCard
              :loadout="selectedLoadout"
              @click="isLoadoutDrawerOpened = true"
            />
          </button>
        </InteractableSounds>
        <InteractableSounds>
          <UiIconButton
            name="mdi:close"
            class="c-red-6"
            @click="selectLoadout({ lobbyId: lobby._id, loadoutId: undefined })"
          />
        </InteractableSounds>
      </template>
      <InteractableSounds v-else>
        <UiButton class="ghost-button" @click="isLoadoutDrawerOpened = true">
          Select your deck
        </UiButton>
      </InteractableSounds>

      <LobbyLoadoutDrawer v-model:is-opened="isLoadoutDrawerOpened" :lobby="lobby" />
    </template>

    <template v-else>
      <p v-if="lobbyUser.presence === 'offline'" class="c-error">
        This player is offline
      </p>
      <p v-else-if="!lobbyUser.loadout">Choosing deck...</p>
    </template>
  </li>
</template>

<style scoped lang="postcss">
.lobby-user {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  margin-block: var(--size-2);

  font-size: var(--font-size-2);
  font-weight: var(--font-weight-5);
  > img {
    overflow: hidden;
    border-radius: var(--radius-round);
  }
  > img,
  > svg {
    flex-shrink: 0;
  }

  &.offline {
    opacity: 0.5;
  }
}
</style>
