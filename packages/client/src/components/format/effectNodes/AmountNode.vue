<script setup lang="ts">
import { CardNode, PlayerNode, UnitNode } from '#components';
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
  maxHp: { label: 'Equals to the maxHp of a unit', params: { unit: UnitNode } },
  card_played_since_last_turn: {
    label: 'Number of cards played this turn',
    params: { card: CardNode, scale: null }
  }
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
</script>

<template>
  <div class="flex-1">
    <UiSelect
      :model-value="amount.type"
      class="mb-3 w-full"
      :options="amountOptions"
      :multiple="false"
      @update:model-value="
        type => {
          amount.type = type;

          match(amount)
            .with({ type: 'fixed' }, amount => {
              amount.params = {
                value: 0
              };
            })
            .with(
              {
                type: 'cards_in_hands'
              },
              amount => {
                amount.params = {
                  player: { candidates: [], random: false }
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
                amount.params = {
                  unit: { candidates: [], random: false }
                };
              }
            )
            .with({ type: 'card_played_since_last_turn' }, amount => {
              amount.params = {
                card: { candidates: [], random: false },
                scale: 1
              };
            })
            .exhaustive();
        }
      "
    />

    <div v-for="(param, key) in params" :key="key" class="flex gap-2">
      <span class="capitalize min-w-11">{{ key }}</span>
      <UiTextInput
        v-if="key === 'value' || key === 'scale'"
        :id
        v-model="(amount.params as any)[key]"
        class="mb-3 flex-1"
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
