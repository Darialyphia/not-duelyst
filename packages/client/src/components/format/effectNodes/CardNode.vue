<script setup lang="ts">
import type { CardConditionBase, Filter } from '@game/sdk';
import { match } from 'ts-pattern';
import { NumericOperatorNode, AmountNode, PlayerNode, BlueprintNode } from '#components';

const groups = defineModel<Filter<CardConditionBase>>({ required: true });

const cardDict = useCardConditions();

const cardOptions = computed(
  () =>
    Object.entries(cardDict.value).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: CardConditionBase['type'] }>
);

const getParams = (groupIndex: number, conditionIndex: number) =>
  cardDict.value[groups.value.candidates[groupIndex][conditionIndex].type]?.params ?? [];

const componentNodes: Record<string, Component | string> = {
  operator: NumericOperatorNode,
  amount: AmountNode,
  player: PlayerNode,
  blueprint: BlueprintNode
};
</script>

<template>
  <ConditionsNode v-slot="{ conditionIndex, groupIndex }" v-model="groups">
    <UiSelect
      class="w-full"
      :model-value="groups.candidates[groupIndex][conditionIndex]['type']"
      :multiple="false"
      :options="cardOptions"
      @update:model-value="
        type => {
          if (!type) return;
          const condition = groups.candidates[groupIndex][conditionIndex];

          condition.type = type;

          match(condition)
            .with(
              { type: 'any_card' },
              { type: 'self' },
              { type: 'minion' },
              { type: 'spell' },
              { type: 'artifact' },
              () => {
                return;
              }
            )
            .with({ type: 'index_in_hand' }, condition => {
              condition.params = {
                index: 0
              };
            })
            .with({ type: 'cost' }, condition => {
              condition.params = {
                operator: 'equals',
                amount: { type: 'fixed', params: { value: 0 } }
              };
            })
            .with({ type: 'from_player' }, condition => {
              condition.params = {
                player: { candidates: [[{ type: undefined as any }]], random: false }
              };
            })
            .with({ type: 'has_blueprint' }, condition => {
              condition.params = {
                blueprint: []
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
