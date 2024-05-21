<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'Matchmaking',
  pageTransition: {
    name: 'matchmaking',
    mode: 'out-in'
  }
});

const { isLoading, data: matchmakingUser } = useConvexAuthedQuery(
  api.matchmaking.myMatchmakingUser,
  {}
);
</script>

<template>
  <div class="page container">
    <header>
      <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
      <h1 class="text-5">Ranked Game</h1>
    </header>

    <ClientOnly>
      <template #fallback>
        <div />
      </template>
      <MatchmakingForm v-if="!isLoading" :matchmaking-user="matchmakingUser" />
    </ClientOnly>
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
.page {
  height: 100vh;

  > header {
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}
</style>
