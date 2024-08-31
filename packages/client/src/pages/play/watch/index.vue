<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'WatchList'
});

const { data: ongoingGames, isLoading: isLoadingOngoing } = useConvexAuthedQuery(
  api.games.getAllOngoing,
  {}
);
const {
  data: latestReplays,
  isLoading: isLoadingLatest,
  error: latestError
} = useConvexAuthedQuery(api.games.latestGamesWithReplays, {});
</script>

<template>
  <div class="container">
    <header>
      <BackButton />
      <h1 class="text-5">Watch</h1>
    </header>
    <TabsRoot class="tabs" default-value="ongoing">
      <TabsList aria-label="select section" class="tabs-list">
        <TabsIndicator class="tabs-indicator">
          <div class="w-full h-full bg-white" />
        </TabsIndicator>
        <TabsTrigger class="tab-trigger" value="ongoing">Ongoing games</TabsTrigger>
        <TabsTrigger class="tab-trigger" value="latest">Latest replays</TabsTrigger>
      </TabsList>

      <TabsContent class="tab" value="ongoing">
        <div v-if="isLoadingOngoing">Loading...</div>
        <div v-else class="fancy-surface flex flex-col gap-4">
          <p v-if="!ongoingGames.length">
            There are no ongoing game at the moment. Check back later !
          </p>

          <GameCard
            v-for="game in ongoingGames"
            :key="game._id"
            :game="game"
            :link="{
              name: 'WatchGame',
              params: { id: game._id },
              query: { roomId: game.roomId }
            }"
          />
        </div>
      </TabsContent>

      <TabsContent class="tab" value="latest">
        <div v-if="isLoadingLatest">Loading...</div>
        <div v-else-if="latestError" class="fancy-surface c-red-6">{{ latestError }}</div>

        <div v-else class="fancy-surface flex flex-col gap-4">
          <p v-if="!latestReplays.length">
            No replays are available at the moment. Check back later !
          </p>

          <GameCard
            v-for="game in latestReplays"
            :key="game._id"
            :game="game"
            :link="{
              name: 'Replay',
              params: { id: game._id }
            }"
          />
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped lang="postcss">
header {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  margin-bottom: var(--size-6);
  padding-top: var(--size-5);

  text-shadow: black 0px 4px 1px;
}

.tabs {
  display: flex;
  flex-direction: column;
}

.tabs-list {
  position: relative;
  display: flex;
  flex-shrink: 0;
  gap: var(--size-2);
}

.tabs-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateX(var(--radix-tabs-indicator-position));

  width: var(--radix-tabs-indicator-size);
  height: 2px;

  border-radius: var(--radius-pill);

  transition-duration: 300ms;
  transition-property: width, transform;
}

.tab-trigger {
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 var(--size-3) var(--size-3);

  font-family: inherit;
  font-size: var(--font-size-2);
  line-height: 1;
  text-shadow: black 0px 4px 1px;
  &:first-of-type {
    padding-left: 0;
  }
}

.tab {
  flex-grow: 1;
  padding-block: var(--size-3);
  outline: none;
  &:focus-visible {
    box-shadow: 0 0 0 2px black;
  }
}
</style>
