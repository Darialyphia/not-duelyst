<script setup lang="ts">
import { api, type UserDto } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { FriendlyChallenge } from '@game/api/src/convex/friend/friendRequest.entity';
import type { Nullable } from '@game/shared';

const { friend } = defineProps<{
  friend: UserDto & {
    challenge: Nullable<FriendlyChallenge>;
    friendRequestId: Id<'friendRequests'>;
    unreadMessagesCount: number;
  };
}>();

const emit = defineEmits<{ conversationClick: [] }>();
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

const { data: featureFlags } = useConvexQuery(api.featureFlags.all, {});
</script>

<template>
  <li :data-presence="friend.presence">
    <img :src="friend.avatar" class="avatar" />
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
    <div class="flex gap-2 ml-auto">
      <UiIconButton
        v-if="featureFlags.friendlies"
        name="mdi:sword-cross"
        class="subtle-button"
        :disabled="hasOngoingGame"
        @click="sendChallenge({ challengedId: friend._id })"
      />
      <UiIconButton
        name="system-uicons:speech-bubble"
        class="subtle-button"
        :data-count="friend.unreadMessagesCount || undefined"
        @click="emit('conversationClick')"
      />
      <NuxtLink
        v-slot="{ href, navigate }"
        custom
        :to="friend.slug ? { name: 'Profile', params: { slug: friend.slug } } : undefined"
      >
        <UiIconButton
          class="subtle-button"
          name="material-symbols-light:search-rounded"
          :href="href"
          @click="navigate"
        />
      </NuxtLink>
    </div>
  </li>
</template>

<style scoped lang="postcss">
li {
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

.avatar {
  overflow: hidden;
  aspect-ratio: 1;
  width: 32px;
  border-radius: var(--radius-round);
}

[data-count] {
  position: relative;
  &::after {
    content: attr(data-count);

    position: absolute;
    z-index: 999;
    top: calc(100% - var(--size-3));
    right: calc(-1 * var(--size-1));
    scale: 0.75;
    display: grid;
    place-content: center;

    min-width: 1.5em;
    height: 1.5em;
    padding: var(--size-1);

    font-size: var(--notification-size, var(--font-size-00));
    color: white;
    text-shadow: none;

    background: var(--red-8);
    border-radius: var(--radius-pill);
  }
}
</style>
