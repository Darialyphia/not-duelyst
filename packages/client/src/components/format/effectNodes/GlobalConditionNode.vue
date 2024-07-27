<script setup lang="ts">
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

const isComponent = (x: unknown): x is Component => {
  return isObject(x) && 'render' in x;
};

watchEffect(() => {
  groups.value.forEach(group => {
    group.forEach(condition => {
      if (!condition.type) return;
      if (!condition.params) {
        condition.params = {} as any;
      }

      match(condition)
        .with({ type: 'player_gold' }, { type: 'player_hp' }, ({ params }) => {
          // @ts-expect-error
          params.amount ??= { type: undefined };
          params.operator ??= 'equals';
          params.player ??= [[{ type: undefined as any }]];
        })
        .with({ type: 'unit_state' }, ({ params }) => {
          params.unit ??= [[{ type: undefined as any }]];
          params.mode ??= 'all';
          params.position ??= [[{ type: undefined as any }]];
          params.attack = {
            amount: params.attack?.amount ?? ({ type: undefined } as any),
            operator: params.attack?.operator ?? 'equals'
          };
          params.hp = {
            amount: params.hp?.amount ?? ({ type: undefined } as any),
            operator: params.hp?.operator ?? 'equals'
          };
        })
        .exhaustive();
    });
  });
});
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
                },
                keyword: undefined as any
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

      <template v-else-if="key === 'keyword'">
        <KeywordNode v-model="(groups[groupIndex][conditionIndex].params as any)[key]" />
      </template>

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
