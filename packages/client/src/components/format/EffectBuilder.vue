<script setup lang="ts">
import {
  CARD_KINDS,
  type ExecutionContext,
  type WidenedGenericCardEffect,
  type GenericSerializedBlueprint
} from '@game/sdk';
import { match } from 'ts-pattern';
import { isDefined, type Nullable } from '@game/shared';

const { blueprint } = defineProps<{ blueprint: GenericSerializedBlueprint }>();
const effect = defineModel<WidenedGenericCardEffect>('effect', { required: true });

const internal = ref(structuredClone(toRaw(effect.value)));
watchEffect(() => {
  effect.value = internal.value;
});

watch(
  () => blueprint.id,
  () => {
    internal.value = effect.value;
  }
);

const executionContext = computed({
  get() {
    return internal.value.config.executionContext;
  },
  set(val) {
    match(val)
      .with('on_init', 'immediate', () => {
        internal.value.config.executionContext = val;
        internal.value.config.actions = [];
        internal.value.config.triggers = undefined;
      })
      .otherwise(() => {
        internal.value.config.executionContext = val;
        internal.value.config.actions = [];
        // @ts-expect-error
        internal.value.config.triggers = [{ type: undefined, params: {} }];
      });
  }
});

const executionContextOptions = computed(() => {
  const ctxs: Array<
    Nullable<{
      label: string;
      value: ExecutionContext;
      disabled?: boolean;
    }>
  > = [
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
    blueprint.kind === CARD_KINDS.ARTIFACT
      ? {
          value: 'while_equiped',
          label: 'While this artifact is equiped'
        }
      : null,
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

  return ctxs.filter(isDefined) as Array<{
    label: string;
    value: ExecutionContext;
  }>;
});

const isDebugOpen = ref(false);
const id = useId();

useUnitConditionsProvider(ref({}));
usePlayerConditionsProvider(ref({}));
useCellConditionsProvider(ref({}));
usePlayerConditionsProvider(ref({}));
</script>

<template>
  <div class="effect-builder">
    <h4>
      Text
      <UiSimpleTooltip text="Put keywords and unit names between @ to highlight them">
        <sup class="tooltip">
          <Icon name="mdi:information-outline" />
        </sup>
      </UiSimpleTooltip>
    </h4>
    <UiTextInput :id="`${id}-text`" v-model="internal.text" class="mb-3" />
    <div class="flex items-center gap-3">
      <h4>When to run this effect:</h4>
      <UiSelect v-model="executionContext" :options="executionContextOptions" />
    </div>

    <template v-if="internal.config.triggers">
      <h4>Triggers</h4>
      <template v-for="(trigger, index) in internal.config.triggers" :key="index">
        <div class="pl-6">
          <TriggerNode
            v-model:trigger="internal.config.triggers[index] as any"
            @delete="internal.config.triggers.splice(index, 1)"
          />
        </div>
        <div v-if="index < internal.config.triggers.length - 1" class="text-center m-2">
          - OR -
        </div>
      </template>
      <UiButton
        class="subtle-button mx-auto my-4"
        @click="internal.config.triggers.push({ type: 'on_unit_play', params: {} })"
      >
        Add trigger
      </UiButton>
    </template>
    <h4>Actions</h4>
    <ul>
      <li v-for="(action, index) in internal.config.actions" :key="index" class="action">
        <InitActionNode
          v-if="internal.config.executionContext === 'on_init'"
          v-model="internal.config.actions[index]"
        />
        <ActionNode
          v-else
          v-model="internal.config.actions[index]"
          :triggers="internal.config.triggers"
        />
      </li>
      <UiButton
        class="subtle-button"
        left-icon="material-symbols:add"
        @click="internal.config.actions.push({ type: undefined, params: {} })"
      >
        Add action
      </UiButton>
    </ul>

    <CollapsibleRoot v-model:open="isDebugOpen">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <CollapsibleTrigger as-child>
          <UiButton class="ghost-button" type="button">Debug</UiButton>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent as="pre" class="debug fancy-scrollbar">
        {{ internal }}
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>

<style scoped lang="postcss">
.effect-builder {
  position: relative;
  padding: var(--size-3);
  background-color: hsl(0 0 0 / 0.4);
  border: solid var(--border-size-1) var(--border-dimmed);
}

h4 {
  margin-block: var(--size-2);
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  color: var(--primary);
}

.action {
  padding-block: var(--size-3);
  border-bottom: solid var(--border-size-1) var(--border-dimmed);
}

.tooltip {
  transform: translateY(-15px);
}

.debug {
  position: fixed;
  z-index: 99;
  top: 10dvh;
  left: 0;

  overflow: auto;

  width: var(--size-xs);
  height: 80dvh;

  background-color: var(--surface-2);
  border: solid 1px var(--border);
}
</style>
