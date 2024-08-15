<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'shockwaveOnEntity' }>({ required: true });

watchEffect(() => {
  step.value.params.wavelength ??= 100;
  step.value.params.radius ??= 800;
  step.value.params.entity ??= { candidates: [[{ type: 'any_unit' }]] };
});
</script>

<template>
  <h4>Play a shockwave on a unit</h4>
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
  <label for="radius">Radius</label>
  <UiTextInput
    id="radius"
    v-model.number="step.params.radius"
    type="number"
    max="1"
    step="1"
  />
  <br />

  <label for="radius">Wavelength</label>
  <UiTextInput
    id="wavelength"
    v-model.number="step.params.wavelength"
    type="number"
    max="1"
    step="1"
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
