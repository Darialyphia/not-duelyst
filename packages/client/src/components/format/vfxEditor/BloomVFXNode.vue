<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'bloomScreen' }>({ required: true });

watchEffect(() => {
  step.value.params.strength ??= 1;
});
</script>

<template>
  <h4>Add Bloom to the whole screen</h4>
  <label for="duration">Duration</label>
  <UiTextInput
    id="duration"
    v-model.number="step.params.duration"
    type="number"
    max="10000"
    min="0"
    step="100"
  />

  <br />

  <label for="alpha">Strength</label>
  <UiTextInput
    id="alpha"
    v-model.number="step.params.strength"
    type="number"
    max="1"
    min="0"
    step="0.01"
  />
</template>

<style scoped lang="postcss">
label,
legend {
  font-size: var(--font-size-2);
  font-weight: var(--font-size-5);
  color: var(--primary);
}

fieldset label {
  font-size: var(--font-size-1);
}
</style>
