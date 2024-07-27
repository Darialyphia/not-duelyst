<script setup lang="ts">
import { CARDS } from '@game/sdk';

const blueprintId = defineModel<string>({ required: true });

const format = useFormat();

const allCards = computed(() => ({ ...format.value.cards, ...CARDS }));
const options = computed(() =>
  Object.entries(allCards.value)
    .map(([key, value]) => ({
      label: value.name,
      value: key
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <UiSelect v-model="blueprintId" :options />
</template>
