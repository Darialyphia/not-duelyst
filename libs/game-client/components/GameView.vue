<script setup lang="ts">
import type { GameSession, GameState } from '../../sdk/src';

const { gameSession } = defineProps<{ gameSession: GameSession }>();

const state = ref<GameState>(gameSession.getState());

let unsub: () => void | undefined;
onMounted(() => {
  const unsub = gameSession.subscribe(event => {
    console.log(event);
    state.value = gameSession.getState();
  });
});
</script>

<template>
  <div class="p-5 c-red-6">
    <h2>Game view</h2>
    <pre>{{ state }}</pre>
  </div>
</template>
