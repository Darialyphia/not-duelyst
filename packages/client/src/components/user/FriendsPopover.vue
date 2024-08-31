<script setup lang="ts">
import { api } from '@game/api';

const isOpened = ref(false);

const { data: friendRequests } = useConvexAuthedQuery(api.friends.newRequests, {});

const unseenRequests = computed(() => {
  return friendRequests.value?.filter(request => !request.seen) ?? [];
});

const { mutate: markAsSeen } = useConvexAuthedMutation(api.friends.markAsSeen);
const openedTab = ref<'friends' | 'friendRequests'>('friends');
watchEffect(() => {
  if (openedTab.value === 'friendRequests') {
    markAsSeen({});
  }
});

const { data: friends } = useConvexAuthedQuery(api.friends.all, {});

const { data: me } = useConvexAuthedQuery(api.users.me, {});
const pendingChallenges = computed(() => {
  if (!friends.value) return [];

  return friends.value
    .filter(friend => friend.challenge && friend.challenge.challengedId === me.value?._id)
    .map(friend => friend.challenge);
});
const unreadMessagescount = computed(() => {
  if (!friends.value) return 0;

  return friends.value.reduce((total, friend) => total + friend.unreadMessagesCount, 0);
});

const notificationsCount = computed(() => {
  const total =
    unseenRequests.value.length +
    pendingChallenges.value.length +
    unreadMessagescount.value;

  if (total > 100) return '99+';

  return total || undefined;
});
</script>

<template>
  <PopoverRoot v-model:open="isOpened">
    <div
      :data-count="notificationsCount"
      class="friends-popover-toggle"
      :style="{ '--notification-size': 'var(--font-size-2)' }"
    >
      <PopoverTrigger as-child>
        <UiFancyButton
          :style="{ '--hue': '200', '--hue2': '100' }"
          @click="isOpened = true"
        >
          <Icon name="lucide:users-round" />
        </UiFancyButton>
      </PopoverTrigger>
    </div>
    <Transition name="friends-popover">
      <PopoverContent :side-offset="10" as-child :collision-padding="20">
        <div class="popover-content fancy-surface">
          <div>
            <TabsRoot v-model="openedTab" class="tabs" default-value="ongoing">
              <TabsList aria-label="select section" class="tabs-list">
                <TabsIndicator class="tabs-indicator">
                  <div class="w-full h-full bg-white" />
                </TabsIndicator>
                <TabsTrigger
                  class="tab-trigger"
                  value="friends"
                  :data-count="pendingChallenges.length || undefined"
                >
                  Friends
                </TabsTrigger>
                <TabsTrigger
                  class="tab-trigger"
                  :data-count="unseenRequests.length || undefined"
                  value="friendRequests"
                >
                  Friend Requests
                </TabsTrigger>
              </TabsList>

              <TabsContent class="tab" value="friends">
                <FriendList />
              </TabsContent>

              <TabsContent class="tab" value="friendRequests">
                <FriendRequestList />
              </TabsContent>
            </TabsRoot>
          </div>

          <div id="conversation"></div>
        </div>
      </PopoverContent>
    </Transition>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.friends-popover-toggle {
  position: relative;
  display: grid;

  @screen lt-lg {
    bottom: var(--size-2);
    left: var(--size-2);
  }

  > button {
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    min-width: 0;
    padding: var(--size-3);

    font-size: var(--font-size-4);
  }
}

.popover-content {
  z-index: 1;
  display: flex;
  height: var(--size-15);
  padding: 0;

  > div:first-of-type {
    width: var(--size-14);
  }
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

  padding: var(--size-5) var(--size-3) 0;
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
  &::after {
    content: attr(data-count);

    position: absolute;
    z-index: 999;
    top: calc(-1 * var(--size-3));
    right: calc(-1 * var(--size-1));

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
  &.tab-trigger {
    position: relative;
  }
}
</style>
