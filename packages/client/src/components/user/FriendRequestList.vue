<script setup lang="ts">
import { api } from '@game/api';

const { data: friendRequests, isLoading } = useConvexAuthedQuery(
  api.friends.newRequests,
  {}
);

const { mutate: accept } = useConvexAuthedMutation(api.friends.acceptFriendRequest);
const { mutate: decline } = useConvexAuthedMutation(api.friends.declineFriendRequest);
</script>

<template>
  <p v-if="isLoading">Loading you friends list...</p>
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
</template>
