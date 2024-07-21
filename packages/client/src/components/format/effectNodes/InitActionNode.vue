<script setup lang="ts">
import type { InitAction } from '@game/sdk';

const options = [
  { label: 'Airdrop', value: 'airdrop' },
  { label: 'Rush', value: 'rush' }
] satisfies Array<{ label: string; value: InitAction['type'] }>;

const action = defineModel<InitAction>('action', { required: true });
const vModel = computed({
  get() {
    return action.value.type;
  },
  set(val) {
    action.value = { type: val };
  }
});
</script>

<template>
  <UiSelect v-model="vModel" :options placeholder="Select an action" />
</template>
