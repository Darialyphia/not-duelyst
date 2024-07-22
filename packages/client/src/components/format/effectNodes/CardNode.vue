<script setup lang="ts">
import type { CardConditionBase, Filter } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<CardConditionBase>>({ required: true });

const cardDict = useCardConditions();

const cardOptions = computed(
  () =>
    Object.entries(cardDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: CardConditionBase['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  cardDict.value[groups.value[groupIndex][conditionIndex].type]?.params ?? [];

watchEffect(() => {
  groups.value.forEach(group => {
    group.forEach(condition => {
      if (!condition.type) return;
      match(condition).otherwise(() => {
        return;
      });
      // .exhaustive();
    });
  });
});
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex, ...slotProps }" v-model="groups">
    <UiCombobox
      v-bind="slotProps"
      class="w-full"
      :options="cardOptions"
      :display-value="val => cardDict[val as CardConditionBase['type']].label as string"
    />
    <div v-if="getParams(groupIndex, conditionIndex).length" class="my-2 font-500">
      Conditions
    </div>
    <div
      v-for="param in getParams(groupIndex, conditionIndex)"
      :key="param"
      class="flex gap-2"
    >
      <span class="capitalize">{{ param }}</span>
      <input
        v-if="param === 'index'"
        v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
        type="number"
      />
    </div>
  </ConditionsNode>
</template>
