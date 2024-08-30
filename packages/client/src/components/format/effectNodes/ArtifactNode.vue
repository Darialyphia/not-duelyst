<script setup lang="ts">
import type { ArtifactCondition, Filter } from '@game/sdk';
import { match } from 'ts-pattern';
import { AmountNode } from '#components';

const groups = defineModel<Filter<ArtifactCondition>>({ required: true });

const artifactDict = useArtifactConditions();

const options = computed(
  () =>
    Object.entries(artifactDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: ArtifactCondition['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  artifactDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params ??
  [];

const componentNodes: Record<string, Component | string> = {
  amount: AmountNode
};
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="options"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with(
              { type: 'equiped_by_ally' },
              { type: 'equiped_by_enemy' },
              { type: 'last_equiped' },
              () => {
                return;
              }
            )
            .with({ type: 'has_durability' }, condition => {
              condition.params = {
                amount: { type: 'fixed', params: { value: 3 } }
              };
            })
            .with({ type: 'position' }, condition => {
              condition.params = {
                index: 0
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
      <input
        v-if="param === 'index'"
        v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        type="number"
      />
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
