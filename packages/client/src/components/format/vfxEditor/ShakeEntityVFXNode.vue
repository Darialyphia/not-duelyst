<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'shakeEntity' }>({ required: true });
</script>

<template>
  <div>{{ step }}</div>
</template>
