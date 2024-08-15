<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'tintScreen' }>({ required: true });

watchEffect(() => {
  step.value.params.alpha ??= 1;
  step.value.params.blendMode ??= 1;
  step.value.params.color ??= '#ff0000';
});

const blendModes = [
  { label: 'Normal', value: '0', id: 'default' },
  { label: 'Add', value: '1', id: 'add' },
  { label: 'Multiply', value: '2', id: 'multiply' },
  { label: 'Screen', value: '3', id: 'screen' }
];

// UiSelect expects a string as value, we need to convert back to number
const blendMode = computed({
  get() {
    return `${step.value.params.blendMode}`;
  },
  set(val) {
    step.value.params.blendMode = parseInt(val, 10) as 0 | 1 | 2 | 3;
  }
});
</script>

<template>
  <h4>Tint the screen</h4>
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

  <label for="alpha">Opacity</label>
  <UiTextInput
    id="alpha"
    v-model.number="step.params.alpha"
    type="number"
    max="1"
    min="0"
    step="0.01"
  />
  <br />

  <label>Color</label>
  <UiColorPicker v-model="step.params.color" />
  <br />

  <label>Blend mode</label>
  <UiRadioGroup v-model="blendMode" :options="blendModes" />
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
