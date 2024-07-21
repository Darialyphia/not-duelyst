<script setup lang="ts">
import { CellNode, KeywordNode } from '#components';
import type { Filter, UnitConditionBase } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<UnitConditionBase>>({ required: true });

const unitDict: Record<UnitConditionBase['type'], { label: string; params: string[] }> = {
  any_unit: { label: 'Is any unit', params: [] },
  is_self: { label: 'is the unit being played', params: [] },
  is_ally: { label: 'Is an ally', params: [] },
  is_enemy: { label: 'Is an enemy', params: [] },
  is_general: { label: 'Is a general', params: [] },
  is_minion: { label: 'Is a minion', params: [] },
  is_nearby: { label: 'Is nearby', params: ['unit', 'cell'] },
  is_in_front: { label: 'Is in front of', params: ['unit'] },
  is_nearest_in_front: { label: 'Is the closest unit in front of', params: ['unit'] },
  is_behind: { label: 'Is behind', params: ['unit'] },
  is_nearest_behind: { label: 'Is the closest unit behind', params: ['unit'] },
  is_above: { label: 'Is above', params: ['unit'] },
  is_nearest_above: { label: 'Is the closest unit above', params: ['unit'] },
  is_below: { label: 'Is below', params: ['unit'] },
  is_nearest_below: { label: 'Is the closest unit  below', params: ['unit'] },
  is_manual_target: { label: 'Is one of this card target', params: ['index'] },
  is_manual_target_general: {
    label: "Is one of this card target's general",
    params: ['index']
  },
  has_keyword: { label: 'Has a specific keyword', params: ['keyword'] }
};

const unitOptions = Object.entries(unitDict).map(([id, { label }]) => ({
  label,
  value: id
})) as Array<{ label: string; value: UnitConditionBase['type'] }>;

const getParams = (groupIndex: number, conditionIndex: number) =>
  unitDict[groups.value[groupIndex][conditionIndex].type]?.params ?? [];

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
