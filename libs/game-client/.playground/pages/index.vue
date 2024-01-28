<script setup lang="ts">
import { makeDummyState } from '~/dummy-state';
</script>

<template>
  <ClientOnly>
    <SandboxGame :initial-state-factory="() => makeDummyState('Test')" />

    <template #fallback>
      <div />
    </template>
  </ClientOnly>
</template>
