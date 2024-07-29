<script setup lang="ts">
import type { WidenedGenericCardEffect } from '@game/sdk';
import { match } from 'ts-pattern';

const effect = defineModel<WidenedGenericCardEffect['config']>({ required: true });

const executionContext = computed({
  get() {
    return effect.value.executionContext;
  },
  set(val) {
    match(val)
      .with('on_init', 'immediate', () => {
        effect.value.executionContext = val;
        effect.value.actions = [];
        effect.value.triggers = undefined;
      })
      .otherwise(() => {
        effect.value.executionContext = val;
        effect.value.actions = [];
        // @ts-expect-error
        effect.value.triggers = [{ type: undefined, params: {} }];
      });
  }
});

const executionContextOptions = computed(() => {
  return [
    {
      value: 'on_init',
      label: 'Start of the game'
    },
    {
      value: 'immediate',
      label: 'When the card is played'
    },
    {
      value: 'while_on_board',
      label: 'While this card is on the board'
    },
    {
      value: 'while_in_hand',
      label: 'While this card is in your hand'
    },
    {
      value: 'while_equiped',
      label: 'While this artifact is equiped'
    },
    {
      value: 'while_in_deck',
      label: 'While this card is in your deck'
    },
    {
      value: 'while_in_deck',
      label: 'While this card is in your graveyard (Soon™)',
      disabled: true
    }
  ];
});
</script>

<template>
  <div class="flex-1">
    <div class="flex items-center gap-3">
      <h4>When to run this effect:</h4>
      <UiSelect v-model="executionContext" :options="executionContextOptions" />
    </div>

    <template v-if="effect.triggers">
      <h4>Trigger</h4>
      <template v-for="(trigger, index) in effect.triggers" :key="index">
        <div class="pl-6">
          <TriggerNode
            v-model:trigger="effect.triggers[index] as any"
            @delete="effect.triggers.splice(index, 1)"
          />
        </div>
        <div v-if="index < effect.triggers.length - 1" class="text-center m-2">
          - OR -
        </div>
      </template>
      <UiButton
        class="subtle-button my-4 w-full"
        @click="effect.triggers.push({ type: 'on_unit_play', params: {} })"
      >
        Add trigger
      </UiButton>
    </template>
    <h4>Actions</h4>
    <ul>
      <li v-for="(action, index) in effect.actions" :key="index" class="action">
        <InitActionNode
          v-if="effect.executionContext === 'on_init'"
          v-model="effect.actions[index]"
        />
        <ActionNode v-else v-model="effect.actions[index]" :triggers="effect.triggers" />
        <UiButton class="error-button" @click="effect.actions.splice(index, 1)">
          Remove action
        </UiButton>
      </li>
    </ul>
    <p v-if="!effect.actions?.length">You have not defined any action yet.</p>
    <UiButton
      class="subtle-button w-full mt-3"
      left-icon="material-symbols:add"
      @click="
        () => {
          if (!effect.actions) {
            effect.actions = [];
          }
          effect.actions.push({ type: undefined, params: {} });
        }
      "
    >
      Add action
    </UiButton>
  </div>
</template>
