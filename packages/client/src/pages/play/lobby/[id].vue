<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import {
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY
} from '@game/api/src/convex/lobby/lobby.constants';

definePageMeta({
  name: 'Lobby',
  pageTransition: {
    name: 'lobby-page',
    mode: 'out-in'
  }
});

const route = useRoute();
const lobbyId = computed(() => route.params.id as Id<'lobbies'>);
const { data: me } = useConvexAuthedQuery(api.users.me, {});
const { data: lobby, isLoading } = useConvexAuthedQuery(
  api.lobbies.byId,
  computed(() => ({
    lobbyId: lobbyId.value
  }))
);
const players = computed(() =>
  lobby.value.users.filter(u => u.role === LOBBY_USER_ROLES.PLAYER)
);
const spectators = computed(() =>
  lobby.value.users.filter(u => u.role === LOBBY_USER_ROLES.SPECTATOR)
);

const { mutate: join } = useConvexAuthedMutation(api.lobbies.join, {});
const myLobbyUser = computed(() => lobby.value.users.find(u => u._id === me.value?._id));

until(lobby)
  .toBeTruthy()
  .then(() => {
    if (!myLobbyUser.value) {
      join({
        lobbyId: lobbyId.value
      });
    }
  });

const isPlayer = computed(() => myLobbyUser.value?.role === LOBBY_USER_ROLES.PLAYER);
const isOwner = computed(() => lobby.value.owner._id === me.value._id);

const { mutate: leaveLobby, isLoading: isLeaving } = useConvexAuthedMutation(
  api.lobbies.leave,
  {
    onSuccess() {
      navigateTo({ name: 'Lobbies' });
    }
  }
);
const { mutate: deleteLobby, isLoading: isDeleting } = useConvexAuthedMutation(
  api.lobbies.remove,
  {
    onSuccess() {
      navigateTo({ name: 'Lobbies' });
    }
  }
);
const { mutate: changeRole } = useConvexAuthedMutation(api.lobbies.changeRole, {});

const chatMessage = ref('');
const { mutate: sendMessage } = useConvexAuthedMutation(api.lobbies.sendMessage, {
  onSuccess() {
    chatMessage.value = '';
  }
});
const chatRoot = ref<HTMLElement>();
const messageCount = computed(() => lobby.value?.messages.length);
watch(
  messageCount,
  () => {
    nextTick(() => {
      const el = unrefElement(chatRoot);
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    });
  },
  { immediate: true }
);

const { mutate: changeFormat } = useConvexAuthedMutation(api.lobbies.selectFormat);
const formatId = computed({
  get() {
    return lobby.value?.format._id;
  },
  set(val) {
    changeFormat({ lobbyId: lobbyId.value, formatId: val });
  }
});

const { data: loadouts } = useConvexAuthedQuery(api.loadout.myLoadouts, {});
const availableLoadouts = computed(() => {
  return loadouts.value.filter(l => l.isValid && l.format._id === lobby.value.format._id);
});
const { mutate: selectLoadout } = useConvexAuthedMutation(api.lobbies.chooseLoadout);
const selectedLoadoutId = computed({
  get() {
    return myLobbyUser.value!.loadout?._id;
  },
  set(val) {
    selectLoadout({ lobbyId: lobbyId.value, loadoutId: val as Id<'loadouts'> });
  }
});
const selectedLoadout = computed(() =>
  loadouts.value.find(l => l._id === selectedLoadoutId.value)
);
const isLoadoutDrawerOpened = ref(false);

const isReady = computed(
  () =>
    players.value.length === MAX_PLAYERS_PER_LOBBY && players.value.every(p => p.loadout)
);
</script>

<template>
  <div class="page container pt-2 px-5 lg:pt-10">
    <UiLoader v-if="isLoading || !myLobbyUser" />
    <template v-else-if="lobby">
      <header>
        <BackButton class="inline-flex" :to="{ name: 'Lobbies' }" />
        <h1 class="text-5">{{ lobby.name }}</h1>
      </header>

      <section class="fancy-surface">
        <div class="left-side">
          <h2>Chat</h2>
          <TransitionGroup ref="chatRoot" tag="ul" class="chat fancy-scrollbar">
            <li v-for="(message, index) in lobby.messages" :key="index">
              <span>{{ message.author }}</span>
              : {{ message.text }}
            </li>
          </TransitionGroup>

          <form
            class="flex gap-3"
            @submit.prevent="sendMessage({ lobbyId, text: chatMessage })"
          >
            <UiTextInput
              id="message"
              v-model="chatMessage"
              class="flex-1"
              aria-label="Send a message"
              placeholder="Type your message here..."
            />
            <UiButton class="primary-button">Send</UiButton>
          </form>
        </div>

        <div class="flex flex-col pt-8">
          <FormatSelector v-if="isOwner" v-model="formatId" class="mb-4" />

          <h2>Players ({{ players.length }}/{{ MAX_PLAYERS_PER_LOBBY }})</h2>
          <p v-if="!players.length">There are no players at the moment.</p>
          <ul v-auto-animate>
            <li v-for="player in players" :key="player._id" class="lobby-user">
              <img src="/assets/portraits/tree.jpg" width="32" />
              <Icon
                v-if="player.loadout"
                name="material-symbols:check"
                class="c-green-6"
              />
              {{ player.name }}
              <template v-if="player._id === me._id">
                <template v-if="selectedLoadout">
                  <button class="w-full">
                    <LoadoutCard
                      :loadout="selectedLoadout"
                      @click="isLoadoutDrawerOpened = true"
                    />
                  </button>
                  <UiIconButton
                    name="mdi:close"
                    class="c-red-6"
                    @click="selectLoadout({ lobbyId, loadoutId: undefined })"
                  />
                </template>
                <UiButton
                  v-else
                  class="ghost-button"
                  @click="isLoadoutDrawerOpened = true"
                >
                  Select your deck
                </UiButton>

                <UiDrawer v-model:is-opened="isLoadoutDrawerOpened" direction="right">
                  <p v-if="!availableLoadouts.length">
                    You have no valid deck in this format.
                    <br />
                    <NuxtLink :to="{ name: 'Collection' }" class="c-primary underline">
                      Go to collection
                    </NuxtLink>
                  </p>
                  <button
                    v-for="loadout in availableLoadouts"
                    :key="loadout._id"
                    class="w-full my-2"
                    @click="
                      () => {
                        selectedLoadoutId = loadout._id;
                        isLoadoutDrawerOpened = false;
                      }
                    "
                  >
                    <LoadoutCard :loadout="loadout" />
                  </button>
                </UiDrawer>
              </template>
              <template v-else>
                <p v-if="!player.loadout">Choosing deck...</p>
              </template>
            </li>
          </ul>
          <UiButton
            v-if="!isPlayer"
            class="ghost-button"
            :disabled="players.length === MAX_PLAYERS_PER_LOBBY"
            left-icon="material-symbols:switch-access-shortcut"
            @click="changeRole({ role: LOBBY_USER_ROLES.PLAYER, lobbyId })"
          >
            Switch to player
          </UiButton>
          <UiButton
            v-if="isPlayer"
            class="ghost-button switch-to-spectator"
            left-icon="material-symbols:switch-access-shortcut"
            @click="changeRole({ role: LOBBY_USER_ROLES.SPECTATOR, lobbyId })"
          >
            Switch to spectator
          </UiButton>

          <h2 class="mt-5">Spectators</h2>
          <p v-if="!spectators.length">There are no spectators at the moment.</p>
          <ul v-auto-animate>
            <li v-for="spectator in spectators" :key="spectator._id" class="lobby-user">
              <img src="/assets/portraits/tree.jpg" width="32" />
              {{ spectator.name }}
            </li>
          </ul>

          <footer class="flex mt-auto">
            <UiButton v-if="isOwner" class="primary-button" :disabled="!isReady">
              Start game
            </UiButton>
            <UiButton
              :is-loading="isDeleting || isLeaving"
              class="error-button ml-auto"
              @click="isOwner ? deleteLobby({ lobbyId }) : leaveLobby({ lobbyId })"
            >
              Leave lobby
            </UiButton>
          </footer>
        </div>
      </section>
    </template>
  </div>
</template>

<style lang="postcss">
.lobby-page-enter-active,
.lobby-page-leave-active {
  transition: all 0.4s;
}

.lobby-page-enter-from,
.lobby-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style scoped lang="postcss">
.page {
  overflow-y: hidden;
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100dvh;
  padding-top: var(--size-2);
  padding-inline: var(--size-5);

  @screen lg {
    padding-block: var(--size-10) var(--size-8);
  }

  > header {
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

h2 {
  font-size: var(--font-size-3);
}

section {
  overflow-y: hidden;
  display: grid;
  grid-template-columns: 1fr var(--size-xs);
  gap: var(--size-3);

  height: 100%;
  > div {
    padding: var(--size-2);
  }
}

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
}

.chat {
  overflow-y: auto;
  flex-grow: 1;

  padding: var(--size-3);

  background-color: oklch(from var(--surface-2) l c h / 30%);
  border: solid 1px var(--border-dimmed);
  li {
    line-height: 2;

    &.v-enter-active {
      transition: all 0.3s;
    }

    &.v-enter-from {
      transform: translateX(var(--size-8));
      opacity: 0;
    }

    > span {
      font-weight: var(--font-weight-5);
      color: var(--primary);
    }
  }
}

.left-side {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);

  height: 100%;
}

.switch-to-spectator:deep(svg) {
  rotate: 180deg;
}
</style>
