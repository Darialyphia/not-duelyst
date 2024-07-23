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
  playerDict.value[groups.value[groupIndex][conditionIndex].type]?.params ?? [];

watchEffect(() => {
  groups.value.forEach(group => {
    group.forEach(condition => {
      if (!condition.type) return;
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
          condition.params ??= {
            index: 0
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
      :options="playerOptions"
      :display-value="
        val => playerDict[val as PlayerConditionBase['type']].label as string
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
        v-model="(groups[groupIndex][conditionIndex] as any).params[param]"
        type="number"
      />
    </div>
  </ConditionsNode>
</template>
