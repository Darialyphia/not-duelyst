<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'tintScreen' }>({
  required: true
});
</script>

<template>
  <div>{{ step }}</div>
</template>
