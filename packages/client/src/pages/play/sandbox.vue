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
    <ClientOnly>
      <SandboxGame
        v-bind="sandboxOptions"
        v-if="sandboxOptions?.player1Loadout && sandboxOptions.player2Loadout"
      />
      <SandboxForm v-else @submit="sandboxOptions = $event" />

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
