<script setup lang="ts">
import type { GenericCardEffect } from '@game/sdk';

const effect = defineModel<GenericCardEffect>('effect', { required: true });
</script>

<template>
  <div class="effect-builder">
    <pre>{{ effect }}</pre>
  </div>
</template>

<style scoped lang="postcss">
.effect-builder {
  padding: var(--size-1);
}
</style>
