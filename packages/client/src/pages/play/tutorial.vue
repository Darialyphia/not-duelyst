<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'Tutorial'
});

const mutation = useConvexAuthedMutation(api.users.completeOnboarding);
onBeforeUnmount(() => {
  mutation.mutate({});
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
