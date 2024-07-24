<script setup lang="ts">
import type { NumericOperator } from '@game/sdk';

const operator = defineModel<NumericOperator>({ required: true });

const options: Array<{ label: string; value: NumericOperator }> = [
  { label: 'Equals', value: 'equals' },
  { label: 'More Than', value: 'more_than' },
  { label: 'Less Than', value: 'less_than' }
];
</script>

<template>
  <UiSelect v-model="operator" :options />
</template>
