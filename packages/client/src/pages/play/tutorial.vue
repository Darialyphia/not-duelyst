<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'Tutorial'
});

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const mutation = useConvexAuthedMutation(api.users.completeOnboarding);
onBeforeUnmount(() => {
  if (!me.value.hasOnboarded) {
    mutation.mutate({ skippedTutorial: true });
  }
});
</script>

<template>
  <div class="page">
    <ClientOnly>
      <TutorialGame />

      <template #fallback>
        <div class="overflow-hidden h-screen" style="background: black"></div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}
</style>
