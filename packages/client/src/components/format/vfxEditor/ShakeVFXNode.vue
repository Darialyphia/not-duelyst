<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';

const step = defineModel<VFXStep & { type: 'shakeScreen' }>({ required: true });

watchEffect(() => {
  step.value.params.amplitude ??= 10;
  step.value.params.isBidirectional ??= true;
});
</script>

<template>
  <h4>Shake screen</h4>
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

  <label class="block">Shake in both directions</label>
  <UiSwitch v-model:checked="step.params.isBidirectional" />
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
