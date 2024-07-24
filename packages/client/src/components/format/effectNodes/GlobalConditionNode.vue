<script setup lang="ts">
import { CellNode, KeywordNode } from '#components';
import type { Filter, GlobalCondition } from '@game/sdk';
import { isObject } from '@game/shared';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<GlobalCondition>>({ required: true });

const globalDict = useGlobalConditions();

const globalOptions = computed(
  () =>
    Object.entries(globalDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: GlobalCondition['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  globalDict.value[groups.value[groupIndex][conditionIndex].type]?.params as
    | Record<string, Params>
    | undefined;

const componentNodes: Record<string, Component | string> = {
  cell: CellNode,
  keyword: KeywordNode
};

const isComponent = (x: unknown): x is Component => {
  return isObject(x) && 'render' in x;
};
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full mb-2"
      :model-value="groups[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="globalOptions"
      @update:model-value="
        type => {
          const condition = groups[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with({ type: 'player_gold' }, { type: 'player_hp' }, () => {
              condition.params = {
                // @ts-expect-error
                amount: { type: undefined },
                operator: 'equals',
                player: [[{ type: undefined as any }]]
              };
            })
            .with({ type: 'unit_state' }, () => {
              condition.params = {
                unit: [[{ type: undefined as any }]],
                mode: 'all',
                position: [[{ type: undefined as any }]],
                attack: {
                  amount: { type: undefined } as any,
                  operator: 'equals'
                },
                hp: {
                  amount: { type: undefined } as any,
                  operator: 'equals'
                }
              };
            })
            .exhaustive();
        }
      "
    />

    <div
      v-for="(param, key) in getParams(groupIndex, conditionIndex)"
      :key="key"
      class="flex gap-2 my-3"
    >
      <span class="capitalize min-w-11">{{ key }}</span>
      <fieldset v-if="key === 'mode'" class="flex flex-col">
        <label>
          <input
            v-model.number="(groups[groupIndex][conditionIndex].params as any)[key]"
            type="radio"
            value="all"
            step="1"
          />
          All the following conditions match
        </label>
        <label>
          <input
            v-model="(groups[groupIndex][conditionIndex].params as any)[key]"
            type="radio"
            value="some"
          />
          Some of the following conditions match
        </label>
        <label>
          <input
            v-model.number="(groups[groupIndex][conditionIndex].params as any)[key]"
            type="radio"
            value="none"
            step="1"
          />
          None of the following conditions match
        </label>
      </fieldset>

      <UiSwitch
        v-else-if="key === 'stackable'"
        v-model:checked="(groups[groupIndex][conditionIndex].params as any)[key]"
      />

      <template v-else-if="isComponent(param)">
        <component
          :is="param"
          v-if="(groups[groupIndex][conditionIndex].params as any)[key]"
          v-model="(groups[groupIndex][conditionIndex].params as any)[key]"
        />
      </template>

      <div v-else class="flex-1">
        <div v-for="(childParam, childKey) in param" :key="childKey" class="flex gap-2">
          <span class="capitalize min-w-11">{{ childKey }}</span>

          <component
            :is="childParam"
            v-if="(groups[groupIndex][conditionIndex].params as any)[key][childKey]"
            v-model="(groups[groupIndex][conditionIndex].params as any)[key][childKey]"
          />
        </div>
      </div>
    </div>
  </ConditionsNode>
</template>
