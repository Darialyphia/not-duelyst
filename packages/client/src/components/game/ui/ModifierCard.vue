<script setup lang="ts">
import type { Modifier } from '@game/sdk';

const { modifier } = defineProps<{ modifier: Modifier }>();
</script>

<template>
  <div class="fancy-surface modifier-card">
    <div class="text-1 mb-1">{{ modifier.name }}</div>
    <p class="text-0">
      {{ modifier.description }}
    </p>
  </div>
</template>

<style scoped lang="postcss">
.modifier-card {
  padding: var(--size-2);
  font-family: monospace;
}
</style>
