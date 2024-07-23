<script setup lang="ts">
import type { CardConditionBase, Filter } from '@game/sdk';
import { match } from 'ts-pattern';
import { NumericOperatorNode, AmountNode } from '#components';

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

const componentNodes: Record<string, Component | string> = {
  operator: NumericOperatorNode,
  amount: AmountNode
};
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiCombobox
      class="w-full"
      :model-value="groups[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="cardOptions"
      :display-value="val => cardDict[val].label"
      @update:model-value="
        type => {
          const condition = groups[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with(
              { type: 'any_card' },
              { type: 'self' },
              { type: 'minion' },
              { type: 'spell' },
              { type: 'artifact' },
              () => {
                return;
              }
            )
            .with({ type: 'index_in_hand' }, condition => {
              condition.params = {
                index: 0
              };
            })
            .with({ type: 'cost' }, condition => {
              condition.params = {
                // @ts-expect-error
                amount: { type: undefined }
              };
            })
            .exhaustive();
        }
      "
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
      <template v-else>
        <component
          :is="componentNodes[param]"
          v-if="(groups[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
    </div>
  </ConditionsNode>
</template>
