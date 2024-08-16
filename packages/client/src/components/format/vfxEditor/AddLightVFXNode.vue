<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'addLightOnEntity' }>({ required: true });

watchEffect(() => {
  step.value.params.alpha ??= 1;
  step.value.params.blendMode ??= 0;
  step.value.params.color ??= 0xff0000;
  step.value.params.entity ??= { candidates: [[{ type: 'any_unit' }]] };
  step.value.params.offset ??= { x: 0, y: 0 };
  step.value.params.radius ??= 100;
});

const color = computed({
  get() {
    return `#${step.value.params.color.toString(16)}`;
  },
  set(newColor) {
    step.value.params.color = parseInt(newColor.slice(1), 16);
  }
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
  <h4>Add Light on unit</h4>
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

  <label>Unit</label>
  <UnitNode v-model="step.params.entity" hide-random />
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

  <fieldset>
    <legend>Offset</legend>
    <label for="offsetX">X axis</label>
    <UiTextInput
      id="offsetX"
      v-model.number="step.params.offset.x"
      type="number"
      step="1"
    />
    <label for="offsetY">Y axis</label>
    <UiTextInput
      id="offsetY"
      v-model.number="step.params.offset.y"
      type="number"
      step="1"
    />
  </fieldset>
  <br />

  <label for="radius">Radius</label>
  <UiTextInput
    id="radius"
    v-model.number="step.params.radius"
    min="0"
    type="number"
    step="1"
  />

  <label>Color</label>
  <UiColorPicker v-model="color" />
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
