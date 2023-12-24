<script setup lang="ts">
import { api } from '@hc/api';

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
</script>

<template>
  <h1>Matchmaking</h1>
  <div v-if="isActive">{{ duration }}</div>
  <UiButton v-if="isActive" @click="leave()">Leave</UiButton>
  <UiButton v-else @click="join()">Join</UiButton>
</template>
