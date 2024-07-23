<script setup lang="ts">
import {
  AmountNode,
  EffectNode,
  GlobalConditionNode,
  PlayerNode,
  UnitNode
} from '#components';
import type { Action, WidenedGenericCardEffect } from '@game/sdk';
import { match } from 'ts-pattern';

const { triggers } = defineProps<{
  triggers?: WidenedGenericCardEffect['config']['triggers'];
}>();

const action = defineModel<Action>('modelValue', { required: true });

const actionDict: Record<
  Action['type'],
  { label: string; params: Record<string, Component | null> }
> = {
  deal_damage: {
    label: 'Deal damage',
    params: { amount: AmountNode, targets: UnitNode, filter: GlobalConditionNode }
  },
  heal: {
    label: 'Heal',
    params: { amount: AmountNode, targets: UnitNode, filter: GlobalConditionNode }
  },
  draw_cards: {
    label: 'Draw',
    params: { amount: AmountNode, player: PlayerNode, filter: GlobalConditionNode }
  },
  change_stats: {
    label: 'Chang stats',
    params: {
      attack: AmountNode,
      hp: AmountNode,
      targets: UnitNode,
      mode: null,
      stackable: null,
      filter: GlobalConditionNode
    }
  },
  celerity: {
    label: 'Celerity',
    params: { activeWhen: GlobalConditionNode, filter: GlobalConditionNode }
  },
  provoke: {
    label: 'Provoke',
    params: { activeWhen: GlobalConditionNode, filter: GlobalConditionNode }
  },
  destroy_unit: {
    label: 'Destroy units',
    params: { targets: UnitNode, filter: GlobalConditionNode }
  },
  add_effect: {
    label: 'Grant an effect to another unit',
    params: { unit: UnitNode, effect: EffectNode, filter: GlobalConditionNode }
  },
  zeal: {
    label: 'Zeal',
    params: { effect: EffectNode, filter: GlobalConditionNode }
  }
};

const actionOptions = computed(
  () =>
    Object.entries(actionDict).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: Action['type'] }>
);

const params = computed(() => actionDict[action.value.type]?.params ?? []);

watch(
  () => action.value.type,
  () => {
    if (!action.value.type) return;

    if (!action.value.params.filter) {
      action.value.params.filter = [];
    }
    if ('activeWhen' in action.value.params && !action.value.params.activeWhen) {
      action.value.params.activeWhen = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <UiSelect
      :model-value="action.type"
      class="w-full mb-3"
      :options="actionOptions"
      :multiple="false"
      @update:model-value="
        type => {
          action.type = type;

          match(action)
            .with({ type: 'deal_damage' }, action => {
              action.params = {
                // @ts-expect-error
                amount: { type: undefined },
                targets: [[{ type: undefined as any }]],
                filter: []
              };
            })
            .with({ type: 'heal' }, action => {
              action.params = {
                // @ts-expect-error
                amount: { type: undefined },
                targets: [[{ type: undefined as any }]],
                filter: []
              };
            })
            .with({ type: 'draw_cards' }, action => {
              action.params = {
                // @ts-expect-error
                amount: { type: undefined },
                player: [[{ type: undefined as any }]],
                filter: []
              };
            })
            .with({ type: 'change_stats' }, action => {
              action.params = {
                mode: 'give',
                stackable: true,
                // @ts-expect-error
                attack: { type: undefined },
                // @ts-expect-error
                hp: { type: undefined },
                targets: [[{ type: undefined as any }]],
                filter: []
              };
            })
            .with({ type: 'destroy_unit' }, action => {
              action.params = {
                targets: [[{ type: undefined as any }]],
                filter: []
              };
            })
            .with({ type: 'provoke' }, action => {
              action.params = { filter: [], activeWhen: [] };
            })
            .with({ type: 'celerity' }, action => {
              action.params = { filter: [], activeWhen: [] };
            })
            .with({ type: 'zeal' }, action => {
              action.params = {
                // @ts-expect-error
                effect: { executionContext: undefined, actions: [], filter: [] }
              };
            })
            .with({ type: 'add_effect' }, action => {
              action.params = {
                unit: [[{ type: undefined as any }]],
                // @ts-expect-error
                effect: { executionContext: undefined, actions: [] },
                filter: []
              };
            })
            .exhaustive();
        }
      "
    />

    <div v-for="(param, key) in params" :key="key" class="flex gap-2">
      <span class="capitalize min-w-11">{{ key }}</span>
      <fieldset v-if="key === 'mode'">
        <legend>Mode</legend>
        <label>
          <input
            v-model.number="(action.params as any)[key]"
            type="radio"
            value="give"
            step="1"
          />
          Add amount to current stats
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="add" />
          Set to amount
        </label>
      </fieldset>
      <label v-else-if="key === 'stackable'">
        Stackable
        <UiSwitch v-model:checked="(action.params as any)[key]" />
      </label>
      <template v-else>
        <component
          :is="param"
          v-if="(action.params as any)[key]"
          v-model="(action.params as any)[key]"
        />
      </template>
    </div>
  </div>
</template>
