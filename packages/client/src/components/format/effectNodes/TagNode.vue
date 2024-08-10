<script setup lang="ts">
import { TAGS } from '@game/sdk';

const tagId = defineModel<string>({ required: true });

const options = computed(() =>
  Object.values(TAGS)
    .map(value => ({
      label: value.name,
      value: value.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <UiSelect v-model="tagId" :options />
</template>
