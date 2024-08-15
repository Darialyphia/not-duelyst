<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'shakeEntity' }>({ required: true });

watchEffect(() => {
  step.value.params.amplitude ??= 10;
  step.value.params.isBidirectional ??= true;
  step.value.params.entity ??= { candidates: [[{ type: 'any_unit' }]] };
});
</script>

<template>
  <h4>Shake unit</h4>
  <label class="block">Shake in both directions</label>
  <UiTextInput
    id="duration"
    v-model.number="step.params.duration"
    type="number"
    max="10000"
    min="0"
    step="100"
  />
  <br />

  <label>Shake in both directions</label>
  <UiSwitch v-model:checked="step.params.isBidirectional" />
  <br />

  <label>Unit</label>
  <UnitNode v-model="step.params.entity" hide-random />

  <br />
  <label for="amplitude">Amplitude</label>
  <UiTextInput
    id="amplitude"
    v-model.number="step.params.amplitude"
    type="number"
    min="1"
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
