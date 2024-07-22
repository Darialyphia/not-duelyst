<script setup lang="ts">
import { CellNode, KeywordNode } from '#components';
import type { Filter, UnitCondition, UnitConditionBase } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<UnitConditionBase>>({ required: true });

const unitDict = useUnitConditions();

const unitOptions = computed(
  () =>
    Object.entries(unitDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: UnitCondition['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  unitDict.value[groups.value[groupIndex][conditionIndex].type]?.params ?? [];

const componentNodes: Record<string, Component | string> = {
  cell: CellNode,
  keyword: KeywordNode
};

watchEffect(() => {
  groups.value.forEach(group => {
    group.forEach(condition => {
      if (!condition.type) return;

      match(condition)
        .with(
          { type: 'any_unit' },
          { type: 'is_ally' },
          { type: 'is_enemy' },
          { type: 'is_self' },
          { type: 'is_general' },
          { type: 'is_minion' },
          () => {
            return;
          }
        )
        .with(
          { type: 'is_in_front' },
          { type: 'is_nearest_in_front' },
          { type: 'is_behind' },
          { type: 'is_nearest_behind' },
          { type: 'is_above' },
          { type: 'is_nearest_above' },
          { type: 'is_below' },
          { type: 'is_nearest_below' },
          condition => {
            condition.params = {
              unit: []
            };
          }
        )
        .with(
          { type: 'is_manual_target' },
          { type: 'is_manual_target_general' },
          condition => {
            condition.params = {
              index: 0
            };
          }
        )
        .with({ type: 'is_nearby' }, condition => {
          condition.params = { unit: [], cell: [] };
        })
        .with({ type: 'has_keyword' }, condtion => {
          condtion.params = {
            keyword: 'airdrop'
          };
        })
        .exhaustive();
    });
  });
});
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex, ...slotProps }" v-model="groups">
    <UiCombobox
      v-bind="slotProps"
      class="w-full"
      :options="unitOptions"
      :display-value="val => unitDict[val as UnitConditionBase['type']].label as string"
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
      <template v-if="param === 'unit'">
        <UnitNode
          v-if="(groups[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
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
