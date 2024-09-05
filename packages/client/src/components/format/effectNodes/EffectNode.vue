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
      .with('immediate', 'while_in_hand', 'while_on_board', () => {
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
      value: 'immediate',
      label: 'When the card is played'
    },
    {
      value: 'while_on_board',
      label: 'While this card is on the board'
    },
    {
      value: 'trigger_while_on_board',
      label: 'While this card is on the board, whenever...'
    },
    {
      value: 'while_in_hand',
      label: 'While this card is in your hand'
    },
    {
      value: 'trigger_while_in_hand',
      label: 'While this card is in your hand, whenever...'
    },
    {
      value: 'while_equiped',
      label: 'While this artifact is equiped, whenever...'
    },
    {
      value: 'while_in_deck',
      label: 'While this card is in your deck, whenever...'
    },
    {
      value: 'while_in_graveyard',
      label: 'While this card is in your graveyard (Soon™)',
      disabled: true
    }
  ];
});

const isRecipeModalOpened = ref(false);
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
        <ActionNode v-model="effect.actions[index]" :triggers="effect.triggers" />
        <UiButton class="error-button mb-8" @click="effect.actions.splice(index, 1)">
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

<style scoped lang="postcss">
h4 {
  margin-block: var(--size-2);
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--primary);
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-4) var(--size-3);
  > * {
    aspect-ratio: 1;
    width: 100%;
  }
}
</style>
