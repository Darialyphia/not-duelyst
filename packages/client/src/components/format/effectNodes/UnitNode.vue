<script setup lang="ts">
import {
  AmountNode,
  CellNode,
  KeywordNode,
  NumericOperatorNode,
  TagNode
} from '#components';
import type { Filter, UnitCondition } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<UnitCondition>>({ required: true });
const { hideRandom } = defineProps<{ hideRandom?: boolean }>();
const unitDict = useUnitConditions();

const unitOptions = computed(
  () =>
    Object.entries(unitDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: UnitCondition['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  unitDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params ?? [];

const componentNodes: Record<string, Component | string> = {
  cell: CellNode,
  keyword: KeywordNode,
  amount: AmountNode,
  operator: NumericOperatorNode,
  tag: TagNode
};

const id = useId();
</script>

<template>
  <ConditionsNode
    v-slot="{ conditionIndex, groupIndex }"
    v-model="groups"
    :hide-random="hideRandom"
  >
    <UiSelect
      class="w-full mb-2"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="unitOptions"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

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
                  not: false,
                  unit: { candidates: [[{ type: undefined as any }]], random: false }
                };
              }
            )
            .with(
              { type: 'is_manual_target' },
              { type: 'is_manual_target_general' },
              condition => {
                condition.params = {
                  not: false,
                  index: 0
                };
              }
            )
            .with({ type: 'is_nearby' }, condition => {
              condition.params = {
                unit: { candidates: [], random: false },
                cell: { candidates: [], random: false },
                not: false
              };
            })
            .with({ type: 'has_keyword' }, condtion => {
              condtion.params = {
                not: false,
                keyword: undefined as any
              };
            })
            .with({ type: 'has_attack' }, { type: 'has_hp' }, condition => {
              condition.params = {
                not: false,
                amount: { type: undefined } as any,
                operator: 'equals'
              };
            })
            .with({ type: 'any_unit' }, () => {
              return;
            })
            .with(
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
              condition => {
                condition.params = {
                  not: false
                };
              }
            )
            .with({ type: 'has_blueprint' }, condition => {
              condition.params = {
                blueprint: undefined as any,
                not: false
              };
            })
            .with({ type: 'has_tag' }, condition => {
              condition.params = {
                tag: undefined as any,
                not: false
              };
            })
            .with({ type: 'is_same_column' }, { type: 'is_same_row' }, condition => {
              condition.params = {
                cell: { candidates: [], random: false },
                not: false
              };
            })
            .with(
              { type: 'has_highest_attack' },
              { type: 'has_lowest_attack' },
              condition => {
                condition.params = { not: false };
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
      <UiSwitch
        v-if="param === 'not'"
        v-model:checked="
          (groups.candidates[groupIndex][conditionIndex] as any).params[param]
        "
      />
      <div v-else-if="param === 'index'" class="flex gap-3 items-center">
        <UiTextInput
          :id
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
          type="number"
        />
        <span class="c-orange-5 text-0">(0 = first target, 1 = second target, etc)</span>
      </div>
      <template v-else-if="param === 'unit'">
        <UnitNode
          v-if="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-else-if="param === 'blueprint'">
        <BlueprintNode
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-else-if="param === 'keyword'">
        <KeywordNode
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-else-if="param === 'tag'">
        <TagNode
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-else>
        <component
          :is="componentNodes[param]"
          v-if="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
    </div>
  </ConditionsNode>
</template>
