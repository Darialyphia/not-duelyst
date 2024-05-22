<script setup lang="ts">
import { api } from '@game/api';

const isRequestModalOpened = ref(false);

const { data: friends, isLoading: isLoading } = useConvexAuthedQuery(api.friends.all, {});

const { data: me } = useConvexAuthedQuery(api.users.me, {});
const { mutate: sendChallenge } = useConvexAuthedMutation(
  api.friends.sendFriendlyChallenge
);

const { data: currentGame } = useConvexAuthedQuery(api.games.getCurrent, {});

const { mutate: cancel } = useConvexAuthedMutation(api.friends.cancelFriendlyChallenge);
const { mutate: accept } = useConvexAuthedMutation(api.friends.acceptFriendlyChallenge);
const { mutate: decline } = useConvexAuthedMutation(api.friends.declineFriendlyChallenge);

const hasOngoingGame = computed(
  () =>
    !!currentGame.value &&
    currentGame.value?.status !== 'FINISHED' &&
    currentGame.value?.status !== 'CANCELLED'
);
</script>

<template>
  <FriendRequestModal v-model:isOpened="isRequestModalOpened" />

  <p v-if="isLoading">Loading you friends list...</p>
  <div v-else class="h-full flex flex-col">
    <p v-if="!friends.length">You have no friends...yet</p>
    <ul v-else class="friends-list fancy-scrollbar">
      <li v-for="friend in friends" :key="friend._id" :data-presence="friend.presence">
        <img src="/assets/portraits/f1-general.png" />
        {{ friend.name }}

        <template v-if="friend.challenge">
          <template v-if="friend.challenge.challengedId === me._id">
            <UiButton
              class="primary-button ml-auto"
              :style="{ '--ui-button-size': 'var(--font-size-00)' }"
              @click="accept({ challengeId: friend.challenge._id })"
            >
              Accept
            </UiButton>
            <UiButton
              class="error-button"
              :style="{ '--ui-button-size': 'var(--font-size-00)' }"
              @click="decline({ challengeId: friend.challenge._id })"
            >
              Decline
            </UiButton>
          </template>
          <UiButton
            v-else
            class="error-button ml-auto"
            :style="{ '--ui-button-size': 'var(--font-size-00)' }"
            @click="cancel({ challengeId: friend.challenge._id })"
          >
            Cancel
          </UiButton>
        </template>
        <UiIconButton
          v-else
          name="mdi:sword-cross"
          :disabled="hasOngoingGame"
          class="ml-auto"
          @click="sendChallenge({ challengedId: friend._id })"
        />
        <UiIconButton name="system-uicons:speech-bubble" />
      </li>
    </ul>
    <UiButton
      class="ghost-button mt-auto"
      left-icon="material-symbols:add"
      @click="isRequestModalOpened = true"
    >
      Add Friend
    </UiButton>
  </div>
</template>

<style scoped lang="postcss">
.friends-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--size-2);

  > li {
    display: flex;
    gap: var(--size-2);
    align-items: center;
    &::before {
      content: '';

      display: inline-block;

      aspect-ratio: 1;
      width: var(--size-2);
      margin-right: var(--size-1);

      background-color: var(--color);
      border-radius: var(--radius-round);
    }

    > img {
      aspect-ratio: 1;
      width: 33px;
    }

    &[data-presence='offline'] {
      --color: var(--red-7);
    }

    &[data-presence='online'] {
      --color: var(--green-6);
    }

    &[data-presence='away'] {
      --color: var(--orange-4);
    }
  }
}
</style>
