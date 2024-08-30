<script setup lang="ts">
import type { CellCondition, Filter } from '@game/sdk';
import { match } from 'ts-pattern';
import { AmountNode, UnitNode } from '#components';

const groups = defineModel<Filter<CellCondition>>({ required: true });

const cellDict = useCellConditions();

const cellOptions = computed(
  () =>
    Object.entries(cellDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: CellCondition['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  cellDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params ?? [];

const componentNodes: Record<string, Component | string> = {
  unit: UnitNode,
  amount: AmountNode
};

const id = useId();
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="cellOptions"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

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
              { type: 'is_in_front' },
              { type: 'is_behind' },
              { type: 'is_above' },
              { type: 'is_below' },
              condition => {
                condition.params = {
                  unit: { candidates: [[]], random: false }
                };
              }
            )
            .with({ type: 'is_nearby' }, condition => {
              condition.params = {
                unit: { candidates: [], random: false },
                cell: { candidates: [], random: false }
              };
            })
            .with({ type: 'is_at' }, condition => {
              condition.params = {
                x: 0,
                y: 0,
                z: 0
              };
            })
            .with({ type: '2x2_area' }, condition => {
              condition.params = {
                topLeft: { candidates: [[]], random: false }
              };
            })
            .with({ type: '3x3_area' }, condition => {
              condition.params = {
                center: { candidates: [[]], random: false }
              };
            })
            .with(
              { type: 'summon_target' },
              { type: 'attack_source_position' },
              { type: 'attack_target_position' },
              { type: 'heal_source_position' },
              { type: 'heal_target_position' },
              { type: 'moved_path' },
              { type: 'moved_unit_new_position' },
              { type: 'moved_unit_old_position' },
              () => {
                return;
              }
            )
            .with({ type: 'within_cells' }, condition => {
              condition.params = {
                amount: { type: 'fixed', params: { value: 0 } },
                cell: { candidates: [[{ type: 'any_cell' }]] }
              };
            })
            .exhaustive();
        }
      "
    />

    <div
      v-for="param in getParams(groupIndex, conditionIndex)"
      :key="param"
      class="flex gap-2"
    >
      <span class="capitalize">{{ param }}</span>
      <UiTextInput
        v-if="['index', 'x', 'y', 'z'].includes(param)"
        :id
        v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        type="number"
      />
      <template v-if="param === 'topLeft' || param === 'center'">
        <CellNode
          v-if="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
          v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        />
      </template>
      <template v-if="param === 'cell'">
        <CellNode
          v-if="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
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
