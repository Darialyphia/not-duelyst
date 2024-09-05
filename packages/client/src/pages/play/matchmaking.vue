<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'Matchmaking',
  pageTransition: {
    name: 'matchmaking',
    mode: 'out-in'
  }
});

const { data: matchmakingUser } = useConvexAuthedQuery(
  api.matchmaking.myMatchmakingUser,
  {}
);

const { $dayjs } = useNuxtApp();

const { count, inc, reset } = useCounter(0);

const {
  pause,
  resume,
  isActive: isInMatchmaking
} = useIntervalFn(
  () => {
    inc();
  },
  1000,
  { immediate: false }
);

until(matchmakingUser)
  .not.toBeUndefined()
  .then(() => {
    if (matchmakingUser.value) {
      inc(matchmakingUser.value.timeElapsed);
      resume();
    }
  });

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

const availableLoadouts = computed(() =>
  loadouts.value.filter(loadout => loadout.isValid && !isDefined(loadout.format._id))
);
const selectedLoadoutId = ref<Id<'loadouts'> | undefined>(
  matchmakingUser.value?.loadoutId
);
</script>

<template>
  <div class="page container mt-2 px-5 lg:mt-10">
    <header>
      <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
      <h1 class="text-5">Ranked Game</h1>
    </header>

    <h2 class="text-3">Select your loadout</h2>
    <div class="loadouts">
      <div v-if="isLoadingLoadouts">Loading your loadouts...</div>
      <label v-for="loadout in availableLoadouts" :key="loadout._id">
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
      <UiButton
        :disabled="!isInMatchmaking && !selectedLoadoutId"
        class="primary-button"
        @click="
          () => {
            if (isInMatchmaking) {
              leave({});
            } else {
              join({ loadoutId: selectedLoadoutId! });
            }
          }
        "
      >
        {{ isInMatchmaking ? 'Leave' : 'Join' }}
      </UiButton>
      <Transition>
        <p v-if="isInMatchmaking">Searching for opponent...{{ duration }}</p>
      </Transition>
    </footer>
  </div>
</template>

<style lang="postcss">
.matchmaking-enter-active,
.matchmaking-leave-active {
  transition: all 0.4s;
}

.matchmaking-enter-from,
.matchmaking-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style scoped lang="postcss">
header {
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}

footer > button {
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

p {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateX(var(--size-8));
    opacity: 0;
  }
}

p,
h2 {
  text-shadow: black 0px 2px 1px;
}
</style>
