<script setup lang="ts">
import { KEYWORDS, TILES } from '@game/sdk';

const tileId = defineModel<string>({ required: true });

const options = computed(() =>
  Object.values(TILES)
    .map(value => ({
      label: value.name,
      value: value.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <UiSelect v-model="tileId" :options />
</template>
