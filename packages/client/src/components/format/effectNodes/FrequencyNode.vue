<script setup lang="ts">
import type { TriggerFrequency } from '@game/sdk';

const frequency = defineModel<TriggerFrequency>({ required: true });

const options: { value: TriggerFrequency['type']; label: string }[] = [
  { value: 'always', label: 'Always' },
  { value: 'once', label: 'Only once' },
  { value: 'n_per_turn', label: 'X times per turn' }
];

const id = useId();

watchEffect(() => {
  if (frequency.value.type === 'n_per_turn' && !frequency.value.params) {
    frequency.value.params = { count: 1 };
  }
});
</script>

<template>
  <UiSelect v-model="frequency.type" :options />
  <UiTextInput
    v-if="frequency.type === 'n_per_turn'"
    :id
    v-model.numbr="frequency.params.count"
    type="number"
  />
</template>
