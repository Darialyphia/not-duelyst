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
  globalDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params as
    | Record<string, Params>
    | undefined;

const isComponent = (x: unknown): x is Component => {
  return isObject(x) && 'render' in x;
};

watchEffect(() => {
  groups.value.candidates.forEach(group => {
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
          params.player ??= { candidates: [[{ type: undefined as any }]], random: false };
        })
        .with({ type: 'unit_state' }, ({ params }) => {
          params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
          params.mode ??= 'all';
          params.position ??= {
            candidates: [[{ type: undefined as any }]],
            random: false
          };
          params.attack = {
            amount: params.attack?.amount ?? ({ type: undefined } as any),
            operator: params.attack?.operator ?? 'equals'
          };
          params.hp = {
            amount: params.hp?.amount ?? ({ type: undefined } as any),
            operator: params.hp?.operator ?? 'equals'
          };
        })
        .with({ type: 'played_from_hand' }, () => {
          return;
        })
        .with({ type: 'active_player' }, ({ params }) => {
          params.player ??= { candidates: [[{ type: 'ally_player' }]] };
        })
        .with({ type: 'target_exists' }, ({ params }) => {
          params.index ??= 0;
        })
        .with({ type: 'player_has_more_minions' }, ({ params }) => {
          params.player = { candidates: [[{ type: 'ally_player' }]] };
        })
        .exhaustive();
    });
  });
});

const id = useId();
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full mb-2"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="globalOptions"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with({ type: 'player_gold' }, { type: 'player_hp' }, () => {
              condition.params = {
                amount: { type: 'fixed', params: { value: 0 } },
                operator: 'equals',
                player: { candidates: [[{ type: 'ally_player' }]], random: false }
              };
            })
            .with({ type: 'unit_state' }, () => {
              condition.params = {
                unit: { candidates: [[{ type: undefined as any }]], random: false },
                mode: 'all',
                position: { candidates: [[{ type: undefined as any }]], random: false },
                attack: {
                  // keep as is : parser ignores empty object in this specific case
                  amount: { type: undefined as any },
                  operator: 'equals'
                },
                hp: {
                  // keep as is : parser ignores empty object in this specific case
                  amount: { type: undefined as any },
                  operator: 'equals'
                },
                keyword: undefined as any
              };
            })
            .with({ type: 'played_from_hand' }, () => {
              condition.params = {};
            })
            .with({ type: 'active_player' }, () => {
              condition.params = {
                player: { candidates: [[{ type: 'ally_player' }]] }
              };
            })
            .with({ type: 'target_exists' }, () => {
              condition.params = { index: 0 };
            })
            .with({ type: 'player_has_more_minions' }, () => {
              condition.params = {
                player: { candidates: [[{ type: 'ally_player' }]] }
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
            v-model.number="
              (groups.candidates[groupIndex][conditionIndex].params as any)[key]
            "
            type="radio"
            value="all"
            step="1"
          />
          All the following conditions match
        </label>
        <label>
          <input
            v-model="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
            type="radio"
            value="some"
          />
          Some of the following conditions match
        </label>
        <label>
          <input
            v-model.number="
              (groups.candidates[groupIndex][conditionIndex].params as any)[key]
            "
            type="radio"
            value="none"
            step="1"
          />
          None of the following conditions match
        </label>
      </fieldset>

      <template v-else-if="key === 'keyword'">
        <KeywordNode
          v-model="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
        />
      </template>
      <template v-else-if="key === 'tag'">
        <TagNode
          v-model="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
        />
      </template>

      <div v-else-if="key === 'index'" class="flex gap-3 items-center">
        <UiTextInput
          :id
          v-model="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
          type="number"
        />
        <span class="c-orange-5 text-0">(0 = first target, 1 = second target, etc)</span>
      </div>

      <template v-else-if="isComponent(param)">
        <component
          :is="param"
          v-if="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
          v-model="(groups.candidates[groupIndex][conditionIndex].params as any)[key]"
        />
      </template>

      <div v-else class="flex-1">
        <div v-for="(childParam, childKey) in param" :key="childKey" class="flex gap-2">
          <span class="capitalize min-w-11">{{ childKey }}</span>

          <component
            :is="childParam"
            v-if="
              (groups.candidates[groupIndex][conditionIndex].params as any)[key][childKey]
            "
            v-model="
              (groups.candidates[groupIndex][conditionIndex].params as any)[key][childKey]
            "
          />
        </div>
      </div>
    </div>
  </ConditionsNode>
</template>
