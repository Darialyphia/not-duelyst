<script setup lang="ts">
import type { Filter, PlayerConditionBase } from '@game/sdk';
import { match } from 'ts-pattern';

const groups = defineModel<Filter<PlayerConditionBase>>({ required: true });

const playerDict = usePlayerConditions();

const playerOptions = computed(
  () =>
    Object.entries(playerDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: PlayerConditionBase['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  playerDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params ??
  [];
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="playerOptions"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with(
              { type: 'any_player' },
              { type: 'ally_player' },
              { type: 'enemy_player' },
              () => {
                return;
              }
            )
            .with({ type: 'is_manual_target_owner' }, condition => {
              condition.params = {
                index: 0
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
        v-if="param === 'index'"
        v-model="(groups.candidates[groupIndex][conditionIndex] as any).params[param]"
        type="number"
      />
    </div>
  </ConditionsNode>
</template>
