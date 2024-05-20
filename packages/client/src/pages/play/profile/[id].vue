<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'Profile'
});

const route = useRoute();
const { data: profile, isLoading } = useConvexAuthedQuery(api.users.profile, {
  userId: route.params.id as Id<'users'>
});

const gamesWon = computed(() => {
  if (!profile.value.profile) return 0;

  return Object.values(profile.value.profile.stats.gamesByFaction).reduce(
    (total, faction) => total + faction.won,
    0
  );
});

const winrate = computed(() => {
  if (!profile.value.profile) return 0;
  return ((gamesWon.value / profile.value.profile.stats.totalGames) * 100).toFixed(2);
});
</script>

<template>
  <div class="container">
    <header>
      <BackButton class="inline-flex" />
    </header>
    <div v-if="isLoading">Loading profile...</div>
    <div v-else class="container fancy-surface">
      <h1>
        {{ profile.user.name }}
        <span class="text-2">#{{ profile.user.discriminator }}</span>
      </h1>
      <section v-if="profile.profile">
        <h2>Player stats</h2>
        <p v-if="!profile.profile.stats.totalGames">
          This player haven't played any game yet.
        </p>
        <dl v-else>
          <dt>Games played</dt>
          <dd>{{ profile.profile.stats.totalGames }}</dd>
          <dt>Games won</dt>
          <dd>{{ gamesWon }}</dd>
          <dt>Winrate</dt>
          <dd>{{ winrate }}%</dd>
        </dl>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
header {
  width: 100%;
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}
</style>
