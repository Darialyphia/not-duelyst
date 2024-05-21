<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'Tutorial',
  pageTransition: {
    name: 'tutorial',
    mode: 'out-in'
  }
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
    <TutorialGame />
  </div>
</template>

<style lang="postcss">
.tutorial-enter-active {
  transition: all 2s;
}
.tutorial-leave-active {
  transition: all 1s;
}

.tutorial-enter-from,
.tutorial-leave-to {
  filter: brightness(0%);
}
</style>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}
</style>
