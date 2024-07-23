<script setup lang="ts">
import { PlayerNode, UnitNode } from '#components';
import type { Amount, UnitConditionExtras } from '@game/sdk';
import { match } from 'ts-pattern';
type GenericAmount = Amount<{ unit: UnitConditionExtras['type'] }>;
const amount = defineModel<GenericAmount>({
  required: true
});

const amountDict: Record<
  GenericAmount['type'],
  { label: string; params: Record<string, Component | null> }
> = {
  fixed: { label: 'Fixed amount', params: { value: null } },
  cards_in_hands: { label: 'Equals to cards in hand', params: { player: PlayerNode } },
  cost: { label: 'Equals to gold cost of a unit', params: { unit: UnitNode } },
  attack: { label: 'Equals to the attack of a unit', params: { unit: UnitNode } },
  highest_attack: {
    label: 'Equals to the highest attack among units',
    params: { unit: UnitNode }
  },
  lowest_attack: {
    label: 'Equals to the lowest attack among units',
    params: { unit: UnitNode }
  },
  hp: { label: 'Equals to the health of a unit', params: { unit: UnitNode } },
  highest_hp: {
    label: 'Equals to the highest health among units',
    params: { unit: UnitNode }
  },
  lowest_hp: {
    label: 'Equals to the lowest health among units',
    params: { unit: UnitNode }
  },
  maxHp: { label: 'Equals to the maxHp of a unit', params: { unit: UnitNode } }
};

const amountOptions = computed(
  () =>
    Object.entries(amountDict).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: GenericAmount['type'] }>
);

const params = computed(() => amountDict[amount.value.type]?.params ?? []);
const id = useId();

watch(
  () => amount.value.type,
  () => {
    if (!amount.value.type) return;

    match(amount.value)
      .with({ type: 'fixed' }, amount => {
        amount.params ??= {
          value: 0
        };
      })
      .with(
        {
          type: 'cards_in_hands'
        },
        amount => {
          amount.params ??= {
            player: []
          };
        }
      )
      .with(
        { type: 'cost' },
        { type: 'maxHp' },
        { type: 'attack' },
        { type: 'lowest_attack' },
        { type: 'highest_attack' },
        { type: 'hp' },
        { type: 'lowest_hp' },
        { type: 'highest_hp' },
        amount => {
          amount.params ??= {
            unit: []
          };
        }
      )
      .exhaustive();
  }
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

    <div v-for="(param, key) in params" :key="key" class="flex gap-2">
      <span class="capitalize">{{ key }}</span>
      <UiTextInput
        v-if="key === 'value'"
        :id
        v-model="(amount.params as any)[key]"
        class="mb-3"
        type="number"
        step="1"
      />
      <template v-else>
        <component
          :is="param"
          v-if="(amount.params as any)[key]"
          v-model="(amount.params as any)[key]"
        />
      </template>
    </div>
  </div>
</template>
