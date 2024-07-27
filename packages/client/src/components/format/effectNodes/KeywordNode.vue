<script setup lang="ts">
import { KEYWORDS } from '@game/sdk';

const keywordId = defineModel<string>({ required: true });

const options = computed(() =>
  Object.values(KEYWORDS)
    .map(value => ({
      label: value.name,
      value: value.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <UiSelect v-model="keywordId" :options />
</template>
