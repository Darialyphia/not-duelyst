<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

const route = useRoute();
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const { data: currentChallenge } = useConvexAuthedQuery(
  api.friends.currentAcceptedChallenge,
  {}
);

const { data: loadouts, isLoading: isLoadingLoadouts } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);

const selectedLoadoutId = ref<Id<'loadouts'> | undefined>();
watchEffect(() => {
  if (!currentChallenge.value) return;
  if (!me.value) return;
  if (currentChallenge.value.challengedId === me.value._id) {
    selectedLoadoutId.value = currentChallenge.value.challengedLoadoutId;
  } else {
    selectedLoadoutId.value = currentChallenge.value.challengerLoadoutId;
  }
});

const challengeLoadout = computed(() => {
  if (!currentChallenge.value) return null;
  if (!me.value) return null;
  if (currentChallenge.value.challengedId === me.value._id) {
    return currentChallenge.value.challengedLoadoutId;
  } else {
    return currentChallenge.value.challengerLoadoutId;
  }
});

const { mutate: cancel } = useConvexAuthedMutation(api.friends.cancelFriendlyChallenge);
const { mutate: setLoadout } = useConvexAuthedMutation(api.friends.setLoadout);
</script>

<template>
  <UiModal
    :closable="false"
    :is-opened="!!currentChallenge && route.name !== 'Game'"
    title="Friendly Challenge Loby"
    :style="{ '--ui-modal-size': 'var(--size-md)' }"
  >
    <h2 class="text-3">Select your loadout</h2>
    <div class="loadouts">
      <div v-if="isLoadingLoadouts">Loading your loadouts...</div>
      <label v-for="loadout in loadouts" :key="loadout._id">
        <LoadoutCard :loadout="loadout" />

        <input
          v-model="selectedLoadoutId"
          type="radio"
          :value="loadout._id"
          class="sr-only"
        />
      </label>
    </div>

    <footer class="flex justify-center gap-6">
      <UiButton
        class="error-button"
        @click="cancel({ challengeId: currentChallenge!._id })"
      >
        Leave
      </UiButton>
      <UiButton
        class="primary-button"
        :disabled="!selectedLoadoutId"
        @click="
          () => {
            if (challengeLoadout) {
              setLoadout({
                challengeId: currentChallenge!._id,
                loadoutId: undefined
              });
            } else {
              setLoadout({
                challengeId: currentChallenge!._id,
                loadoutId: selectedLoadoutId
              });
            }
          }
        "
      >
        {{ challengeLoadout ? 'Waiting for opponent' : 'Ready' }}
      </UiButton>
    </footer>
  </UiModal>
</template>

<style scoped lang="postcss">
.loadouts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--size-3);
  margin-block: var(--size-4);

  > label {
    cursor: pointer;

    &:has(input:checked) {
      filter: brightness(120%);
      outline: solid var(--border-size-2) var(--primary);
    }

    &:has(input:disabled) {
      filter: grayscale(50%);
    }
  }
}
</style>
