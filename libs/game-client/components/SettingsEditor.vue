<script setup lang="ts">
import { api } from '@hc/api';
import { merge } from 'lodash-es';

const emit = defineEmits<{
  close: [];
}>();

const { data: settings } = useConvexAuthedQuery(api.users.settings, {});
const { mutate: saveSettings } = useConvexAuthedMutation(api.users.saveSettings, {
  onSuccess() {
    emit('close');
  }
});

const formData = ref({
  bindings: defaultBindings
});

until(settings)
  .not.toBeUndefined()
  .then(() => {
    merge(formData.value, settings.value);
  });
</script>

<template>
  <section class="fancy-scrollbar">
    <fieldset>
      <legend>Controls</legend>
      <template v-for="binding in formData.bindings" :key="binding.id">
        <label :for="binding.id" class="mr-4">{{ binding.label }}</label>
        <UiKeyInput v-model="binding.control" />
      </template>
    </fieldset>

    <div>
      <fieldset>
        <legend>Sound</legend>
        <label>Sound effects</label>
        <UiSliderInput :model-value="[50]" label="sound effects volume" class="w-full" />
        <label>Music</label>
        <UiSliderInput :model-value="[50]" label="sound effects volume" class="w-full" />
      </fieldset>
      <fieldset>
        <legend>Accessibility</legend>
      </fieldset>
    </div>
  </section>

  <footer>
    <UiButton class="ghost-button" @click="emit('close')">Cancel</UiButton>
    <UiButton class="primary-button" @click="saveSettings({ settings: formData })">
      Apply
    </UiButton>
  </footer>
</template>

<style scoped lang="postcss">
fieldset {
  user-select: none;

  display: grid;
  grid-template-columns: max-content 1fr;
  row-gap: var(--size-2);
  column-gap: var(--size-3);
  align-items: center;

  padding: var(--size-4);

  border: var(--fancy-border);

  > legend {
    grid-column: 1 / -1;
    font-size: var(--font-size-4);
  }
}

section {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--size-3);

  max-height: 60vh;
  max-height: 60dvh;
  padding-inline: var(--size-2);
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  margin-block-start: var(--size-3);
}
</style>
