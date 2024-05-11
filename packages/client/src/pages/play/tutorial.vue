<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';

definePageMeta({
  name: 'Tutorial'
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
