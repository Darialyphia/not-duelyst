<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';

definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});

const sandboxOptions = ref<{
  player1Loadout: LoadoutDto;
  player2Loadout: LoadoutDto;
}>();

const bgm = useBgm();

const isConfigured = computed(
  () => sandboxOptions.value?.player1Loadout && sandboxOptions.value?.player2Loadout
);
until(isConfigured)
  .toBeTruthy()
  .then(() => {
    bgm.next(BGMS.BATTLE);
  });
</script>

<template>
  <div class="page">
    <SandboxGame
      v-if="sandboxOptions?.player1Loadout && sandboxOptions.player2Loadout"
      v-bind="sandboxOptions"
    />
    <SandboxForm v-else @submit="sandboxOptions = $event" />
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave-active {
  transition: all 0.4s;
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}
</style>
