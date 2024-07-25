<script setup lang="ts">
import {
  type WidenedGenericCardEffect,
  type GenericSerializedBlueprint
} from '@game/sdk';

const { blueprint } = defineProps<{ blueprint: GenericSerializedBlueprint }>();
const effect = defineModel<WidenedGenericCardEffect>('effect', { required: true });

useUnitConditionsProvider(ref({}));
useCardConditionsProvider(ref({}));
useCellConditionsProvider(ref({}));
usePlayerConditionsProvider(ref({}));
useGlobalConditionsProvider(ref({}));

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

const isDebugOpen = ref(false);
const id = useId();
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
    <EffectNode v-model="internal.config" />

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
  background-color: hsl(0 0 100% / 0.03);
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
