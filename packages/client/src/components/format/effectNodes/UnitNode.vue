<script setup lang="ts">
import { AmountNode, CellNode, KeywordNode, NumericOperatorNode } from '#components';
import type { Filter, UnitCondition } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<UnitCondition>>({ required: true });

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
  keyword: KeywordNode,
  amount: AmountNode,
  operator: NumericOperatorNode
};

const id = useId();
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full mb-2"
      :model-value="groups[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="unitOptions"
      @update:model-value="
        type => {
          const condition = groups[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
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
                  unit: [[{ type: undefined as any }]]
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
                keyword: undefined as any
              };
            })
            .with({ type: 'has_attack' }, { type: 'has_hp' }, condition => {
              condition.params = {
                amount: { type: undefined } as any,
                operator: 'equals'
              };
            })
            .with(
              { type: 'any_unit' },
              { type: 'is_ally' },
              { type: 'is_enemy' },
              { type: 'is_self' },
              { type: 'is_general' },
              { type: 'is_minion' },
              { type: 'is_exhausted' },
              { type: 'attack_source' },
              { type: 'attack_target' },
              { type: 'healing_source' },
              { type: 'healing_target' },
              { type: 'destroyed_unit' },
              { type: 'moved_unit' },
              { type: 'played_unit' },
              () => {
                return;
              }
            )
            .exhaustive();
        }
      "
    />
    <div
      v-for="param in getParams(groupIndex, conditionIndex)"
      :key="param"
      class="flex gap-2"
    >
      <span class="capitalize min-w-10">{{ param }}</span>
      <div v-if="param === 'index'" class="flex gap-3 items-center">
        <UiTextInput
          :id
          v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
          type="number"
        />
        <span class="c-orange-5 text-0">(0 = first target, 1 = second target, etc)</span>
      </div>
      <template v-if="param === 'unit'">
        <UnitNode
          v-if="(groups[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-if="param === 'keyword'">
        <KeywordNode
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
