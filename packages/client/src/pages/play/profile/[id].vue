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
</script>

<template>
  <div class="container">
    <header>
      <BackButton />
    </header>
    <div v-if="isLoading">Loading profile...</div>
    <section v-else class="container fancy-surface">
      <h1>{{ profile.user.name }}</h1>
      <pre>
        {{ profile.profile?.stats }}
      </pre>
    </section>
  </div>
</template>

<style scoped lang="postcss">
header {
  width: 100%;
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}
</style>
