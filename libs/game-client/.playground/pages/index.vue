<script setup lang="ts">
import type { SerializedGameState } from '@hc/sdk';
import { makeDummyState } from '~/dummy-state';
</script>

<template>
  <ClientOnly>
    <SandboxGame :initial-state-factory="() => makeDummyState('New Map')" />

    <template #fallback>
      <div />
    </template>
  </ClientOnly>
</template>
