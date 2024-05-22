<script setup lang="ts">
import { api } from '@game/api';

const isOpened = ref(false);

const { data: friends, isLoading: isLoadingFriends } = useConvexAuthedQuery(
  api.friends.all,
  {}
);

const { data: friendRequests, isLoading: isLoadingFriendRequests } = useConvexAuthedQuery(
  api.friends.newRequests,
  {}
);

const unseenRequests = computed(() => {
  return friendRequests.value?.filter(request => !request.seen);
});

const isRequestModalOpened = ref(false);
const name = ref('');
const isNameCorrect = computed(() => /^.+#[0-9]{4}$/.test(name.value));
const { mutate: sendFriendRequest } = useConvexAuthedMutation(
  api.friends.sendFriendRequest,
  {
    onSuccess() {
      name.value = '';
      isRequestModalOpened.value = false;
    }
  }
);
const { mutate: accept } = useConvexAuthedMutation(api.friends.acceptFriendRequest);
const { mutate: decline } = useConvexAuthedMutation(api.friends.declineFriendRequest);
</script>

<template>
  <PopoverRoot v-model:open="isOpened">
    <PopoverTrigger as-child>
      <UiFancyButton
        class="friends-popover-toggle"
        :style="{ '--hue': '200', '--hue2': '100' }"
        @click="isOpened = true"
      >
        <Icon name="lucide:users-round" />
      </UiFancyButton>
    </PopoverTrigger>
    <Transition name="friends-popover">
      <PopoverContent :side-offset="10" as-child :collision-padding="20">
        <div class="popover-content fancy-surface">
          <UiModal
            v-model:is-opened="isRequestModalOpened"
            title="Add Friend"
            :use-portal="false"
            :style="{ '--ui-modal-size': 'var(--size-xs)' }"
          >
            <form
              class="friend-request-modal"
              @submit.prevent="
                () => {
                  const [username, discriminator] = name.split('#');
                  sendFriendRequest({
                    name: username,
                    discriminator
                  });
                }
              "
            >
              <label for="friend-request-name" class="block mb-3">
                Enter your friend's username
              </label>
              <input id="friend-request-name" v-model="name" class="w-full" />
              <p>
                <Icon name="ph:warning-circle" />
                format: username#1234
              </p>

              <footer>
                <UiFancyButton
                  :style="{ '--hue': '0' }"
                  type="button"
                  @click="isRequestModalOpened = false"
                >
                  Cancel
                </UiFancyButton>
                <UiFancyButton :disabled="!isNameCorrect">Send</UiFancyButton>
              </footer>
            </form>
          </UiModal>
          <TabsRoot class="tabs" default-value="ongoing">
            <TabsList aria-label="select section" class="tabs-list">
              <TabsIndicator class="tabs-indicator">
                <div class="w-full h-full bg-white" />
              </TabsIndicator>
              <TabsTrigger class="tab-trigger" value="friends">Friends</TabsTrigger>
              <TabsTrigger
                class="tab-trigger"
                :data-count="unseenRequests.length || undefined"
                value="friendRequests"
              >
                Friend Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent class="tab" value="friends">
              <p v-if="isLoadingFriends">Loading you friends list...</p>
              <div v-else class="h-full flex flex-col">
                <p v-if="!friends.length">You have no friends...yet</p>
                <ul v-else class="friends-list fancy-scrollbar">
                  <li
                    v-for="friend in friends"
                    :key="friend._id"
                    :data-presence="friend.presence"
                  >
                    <img src="/assets/portraits/f1-general.png" />
                    {{ friend.name }}
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
            </TabsContent>

            <TabsContent class="tab" value="friendRequests">
              <p v-if="isLoadingFriendRequests">Loading you friends list...</p>
              <p v-else-if="!friendRequests.length">
                You don't have any friend request at the moment.
              </p>
              <ul v-else>
                <li
                  v-for="friendRequest in friendRequests"
                  :key="friendRequest._id"
                  class="flex gap-3"
                >
                  {{ friendRequest.sender.name }}
                  <UiIconButton
                    class="primary-button ml-auto"
                    name="material-symbols:check-small"
                    aria-label="Accept friend request"
                    @click="accept({ friendRequestId: friendRequest._id })"
                  />
                  <UiIconButton
                    class="primary-button"
                    name="material-symbols:close"
                    aria-label="Decline friend request"
                    @click="decline({ friendRequestId: friendRequest._id })"
                  />
                </li>
              </ul>
            </TabsContent>
          </TabsRoot>
        </div>
      </PopoverContent>
    </Transition>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.friends-popover-toggle {
  position: fixed;
  z-index: 1;
  bottom: var(--size-4);
  left: var(--size-4);

  aspect-ratio: 1;
  width: fit-content;
  min-width: 0;
  padding: var(--size-3);

  font-size: var(--font-size-4);
  line-height: 1;
}

.popover-content {
  width: var(--size-14);
  height: var(--size-15);
  padding-inline: 0;
}
.tabs {
  display: grid;
  grid-template-rows: auto 1fr;
  flex-direction: column;
  height: 100%;
}

.tabs-list {
  position: relative;

  display: flex;
  flex-shrink: 0;
  gap: var(--size-2);

  padding-inline: var(--size-3);
}

.tabs-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateX(var(--radix-tabs-indicator-position));

  width: var(--radix-tabs-indicator-size);
  height: 2px;

  border-radius: var(--radius-pill);

  transition-duration: 300ms;
  transition-property: width, transform;
}

.tab-trigger {
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 var(--size-3) var(--size-3);

  font-family: inherit;
  font-size: var(--font-size-1);
  line-height: 1;
  color: var(--gray-5);
  text-shadow: black 0px 4px 1px;
  &:first-of-type {
    padding-left: 0;
  }
}

.tab {
  overflow-y: auto;
  flex-grow: 1;
  padding: var(--size-3);
  outline: none;
  &:focus-visible {
    box-shadow: 0 0 0 2px black;
  }
}

.friends-popover-enter-active,
.friends-popover-leave-active {
  transition: opacity 0.2s ease-out;
}

.friends-popover-enter-from,
.friends-popover-leave-to {
  opacity: 0;
}

[data-count] {
  position: relative;
  &::after {
    content: attr(data-count);

    position: absolute;
    z-index: 999;
    top: calc(-1 * var(--size-3));
    right: calc(-1 * var(--size-1));

    display: grid;
    place-content: center;

    min-width: 3ch;
    padding: var(--size-1);

    font-size: var(--font-size-00);
    color: white;
    text-shadow: none;

    background-color: var(--red-8);
    border-radius: var(--radius-pill);
  }
}

.friend-request-modal {
  > input {
    border: var(--fancy-border);
  }
  > p {
    margin-top: var(--size-2);
    font-size: var(--font-size-00);
    color: var(--gray-5-hsl);
  }
  > footer {
    display: flex;
    gap: var(--size-6);
    justify-content: space-around;
    margin-top: var(--size-5);
  }
}

.friends-list {
  overflow-y: auto;
  flex-grow: 1;

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
