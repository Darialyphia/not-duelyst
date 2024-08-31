<script setup lang="ts">
import { api, type UserDto } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { FriendlyChallenge } from '@game/api/src/convex/friend/friendRequest.entity';
import type { Nullable } from '@game/shared';

const isRequestModalOpened = ref(false);

const { data: friends, isLoading: isLoading } = useConvexAuthedQuery(api.friends.all, {});
const selectedFriend = ref<
  Nullable<
    UserDto & {
      challenge: Nullable<FriendlyChallenge>;
      friendRequestId: Id<'friendRequests'>;
    }
  >
>();
</script>

<template>
  <FriendRequestModal v-model:isOpened="isRequestModalOpened" />

  <p v-if="isLoading">Loading you friends list...</p>
  <div v-else class="friend-list">
    <p v-if="!friends.length">You have no friends...yet</p>
    <ul v-else class="fancy-scrollbar">
      <FriendListItem
        v-for="friend in friends"
        :key="friend._id"
        :friend="friend"
        @conversation-click="
          () => {
            if (selectedFriend?._id === friend._id) {
              selectedFriend = null;
            } else {
              selectedFriend = friend;
            }
          }
        "
      />
    </ul>
    <UiButton
      class="ghost-button mt-auto"
      left-icon="material-symbols:add"
      @click="isRequestModalOpened = true"
    >
      Add Friend
    </UiButton>

    <Teleport v-if="selectedFriend" to="#conversation">
      <Conversation :friend="selectedFriend" @close="selectedFriend = null" />
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.friend-list {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

ul {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--size-2);
}

.conversation {
  overflow-y: auto;
}
</style>
