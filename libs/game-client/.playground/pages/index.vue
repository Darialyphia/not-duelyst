<script setup lang="ts">
import type { SerializedGameState } from '@hc/sdk';
import { makeDummyState } from '~/dummy-state';

const state = ref<SerializedGameState>();

onMounted(async () => {
  state.value = await makeDummyState('New Map');
});
</script>

<template>
  <ClientOnly>
    <SandboxGame :initial-state="state" v-if="state" />

    <template #fallback>
      <div />
    </template>
  </ClientOnly>
</template>
