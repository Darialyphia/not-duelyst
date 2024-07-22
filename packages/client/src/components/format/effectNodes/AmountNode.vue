<script setup lang="ts">
import type { Amount, UnitConditionExtras } from '@game/sdk';
type GenericAmount = Amount<{ unit: UnitConditionExtras['type'] }>;
const amount = defineModel<GenericAmount>({
  required: true
});

const amountDict: Record<
  GenericAmount['type'],
  { label: string; params: Record<string, Component | null> }
> = {
  fixed: { label: 'Fixed amount', params: {} },
  cards_in_hands: { label: 'Equals to cards in hand', params: {} },
  cost: { label: 'Equals to gold cost of a unit', params: {} },
  attack: { label: 'Equals to the attack of a unit', params: {} },
  highest_attack: { label: 'Equals to the highest attack among units', params: {} },
  lowest_attack: { label: 'Equals to the lowest attack among units', params: {} },
  hp: { label: 'Equals to the health of a unit', params: {} },
  highest_hp: { label: 'Equals to the highest health among units', params: {} },
  lowest_hp: { label: 'Equals to the lowest health among units', params: {} },
  maxHp: { label: 'Equals to the maxHp of a unit', params: {} }
};

const amountOptions = computed(
  () =>
    Object.entries(amountDict).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: GenericAmount['type'] }>
);
</script>

<template>
  <div>
    <UiCombobox
      v-model="amount.type"
      class="w-full mb-3"
      :options="amountOptions"
      :display-value="val => amountDict[val as GenericAmount['type']].label as string"
    />
  </div>
</template>
