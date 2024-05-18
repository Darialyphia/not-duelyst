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

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}
</style>
