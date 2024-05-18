<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { MatchmakingUserDto } from '@game/api/src/convex/matchmaking/matchmaking.mapper';
import type { Nullable } from '@game/shared';

const { matchmakingUser } = defineProps<{
  matchmakingUser: Nullable<MatchmakingUserDto>;
}>();

const { $dayjs } = useNuxtApp();

const { count, inc, reset } = useCounter(0);

if (matchmakingUser) {
  inc(matchmakingUser.timeElapsed);
}

const assets = useAssets();

const {
  pause,
  resume,
  isActive: isInMatchmaking
} = useIntervalFn(
  () => {
    inc();
  },
  1000,
  { immediate: !!matchmakingUser }
);

const { mutate: join } = useConvexAuthedMutation(api.matchmaking.join, {
  onSuccess() {
    reset();
    resume();
  },
  onError(err) {
    console.error(err);
  }
});
const { mutate: leave } = useConvexAuthedMutation(api.matchmaking.leave, {
  onSuccess() {
    pause();
    reset();
  },
  onError(err) {
    console.error(err);
  }
});

const duration = computed(() => {
  // @ts-expect-error
  return $dayjs.duration(count.value * 1000).format('mm:ss');
});

const { data: loadouts, isLoading: isLoadingLoadouts } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);
const selectedLoadoutId = ref<Id<'loadouts'> | undefined>(matchmakingUser?.loadoutId);
</script>

<template>
  <h2 class="text-3">Select your loadout</h2>
  <div v-if="isLoadingLoadouts && assets.loaded">Loading...</div>
  <div class="loadouts">
    <label v-for="loadout in loadouts" :key="loadout._id">
      <LoadoutCard :loadout="loadout"></LoadoutCard>

      <input
        v-model="selectedLoadoutId"
        :disabled="isInMatchmaking"
        type="radio"
        :value="loadout._id"
        class="sr-only"
      />
    </label>
  </div>

  <footer class="flex gap-3 items-center">
    <UiButton v-if="isInMatchmaking" class="error-button" @click="leave({})">
      Leave
    </UiButton>
    <UiButton
      v-else
      :disabled="!selectedLoadoutId"
      class="primary-button"
      @click="join({ loadoutId: selectedLoadoutId! })"
    >
      Join
    </UiButton>
    <div v-if="isInMatchmaking">Searching for opponent...{{ duration }}</div>
  </footer>
</template>

<style scoped lang="postcss">
> footer > button {
  --ui-button-size: var(--font-size-3);

  min-width: var(--size-12);
}

> footer > div {
  font-size: var(--font-size-5);
  text-shadow: black 0px 4px 1px;
}

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
