<script setup lang="ts">
import type { CellConditionBase, Filter } from '@game/sdk';
import { match } from 'ts-pattern';
import { NumericOperatorNode, AmountNode, UnitNode } from '#components';

const groups = defineModel<Filter<CellConditionBase>>({ required: true });

const cellDict = useCellConditions();

const cellOptions = computed(
  () =>
    Object.entries(cellDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: CellConditionBase['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  cellDict.value[groups.value[groupIndex][conditionIndex].type]?.params ?? [];

const componentNodes: Record<string, Component | string> = {
  unit: UnitNode
};
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiCombobox
      class="w-full"
      :model-value="groups[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="cellOptions"
      :display-value="val => cellDict[val].label"
      @update:model-value="
        type => {
          const condition = groups[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with(
              { type: 'any_cell' },
              { type: 'is_empty' },
              { type: 'is_top_left_corner' },
              { type: 'is_top_right_corner' },
              { type: 'is_bottom_left_corner' },
              { type: 'is_bottom_right_corner' },
              () => {
                return;
              }
            )
            .with({ type: 'is_manual_target' }, condition => {
              condition.params = {
                index: 0
              };
            })
            .with(
              { type: 'has_unit' },
              { type: 'is_nearby' },
              { type: 'is_in_front' },
              { type: 'is_behind' },
              { type: 'is_above' },
              { type: 'is_below' },
              condition => {
                condition.params = {
                  unit: [[]]
                };
              }
            )
            .with({ type: 'is_at' }, condition => {
              condition.params = {
                x: 0,
                y: 0,
                z: 0
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
        v-if="['index', 'x', 'y', 'z'].includes(param)"
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
