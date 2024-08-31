<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const { data: loadouts } = useConvexAuthedQuery(api.loadout.myLoadouts, {});
const availableLoadouts = computed(() => {
  return loadouts.value.filter(l => l.isValid && l.format._id === lobby.format._id);
});
const { mutate: selectLoadout } = useConvexAuthedMutation(api.lobbies.chooseLoadout);
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const myLobbyUser = computed(() => lobby.users.find(u => u._id === me.value?._id));

const selectedLoadoutId = computed({
  get() {
    return myLobbyUser.value!.loadout?._id;
  },
  set(val) {
    selectLoadout({ lobbyId: lobby._id, loadoutId: val as Id<'loadouts'> });
  }
});
</script>

<template>
  <UiDrawer v-model:is-opened="isOpened" direction="right">
    <p v-if="!availableLoadouts.length">
      You have no valid deck in this format.
      <br />
      <NuxtLink :to="{ name: 'Collection' }" class="c-primary underline">
        Go to collection
      </NuxtLink>
    </p>
    <InteractableSounds>
      <button
        v-for="loadout in availableLoadouts"
        :key="loadout._id"
        class="w-full my-2"
        @click="
          () => {
            selectedLoadoutId = loadout._id;
            isOpened = false;
          }
        "
      >
        <LoadoutCard :loadout="loadout" />
      </button>
    </InteractableSounds>
  </UiDrawer>
</template>
