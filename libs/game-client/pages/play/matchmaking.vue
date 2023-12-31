<script setup lang="ts">
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';

definePageMeta({
  name: 'Matchmaking'
});

const { count, inc, reset } = useCounter();

const { pause, resume, isActive } = useIntervalFn(
  () => {
    inc();
  },
  1000,
  { immediate: false }
);

const { mutate: join } = useConvexMutation(api.matchmaking.join, {
  onSuccess() {
    reset();
    resume();
  },
  onError(err) {
    console.error(err);
  }
});
const { mutate: leave } = useConvexMutation(api.matchmaking.leave, {
  onSuccess() {
    pause();
    reset();
  },
  onError(err) {
    console.error(err);
  }
});

const dayjs = useDayjs();
const duration = computed(() => {
  // @ts-expect-error
  return dayjs.duration(count.value * 1000).format('mm:ss');
});

const { data: loadouts, isLoading: isLoadingLoadouts } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);
const selectedLoadoutId = ref<Id<'loadouts'>>();
</script>

<template>
  <h1>Matchmaking</h1>
  <h2>Select your loadout</h2>
  <div v-if="isLoadingLoadouts">Loading...</div>
  <label v-for="loadout in loadouts" :key="loadout._id">
    <input v-model="selectedLoadoutId" type="radio" :value="loadout._id" />
    {{ loadout.name }}
  </label>
  <div v-if="isActive">{{ duration }}</div>
  <UiButton v-if="isActive" @click="leave({})">Leave</UiButton>
  <UiButton
    v-else
    :disabled="!selectedLoadoutId"
    @click="join({ loadoutId: selectedLoadoutId! })"
  >
    Join
  </UiButton>
</template>
