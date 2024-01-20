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
    <fieldset class="controls">
      <legend>Controls</legend>
      <template v-for="binding in formData.bindings" :key="binding.id">
        <label :for="binding.id" class="mr-4">{{ binding.label }}</label>
        <UiKeyInput v-model="binding.control" />
      </template>
    </fieldset>
  </section>

  <footer>
    <UiButton class="ghost-button" @click="emit('close')">Cancel</UiButton>
    <UiButton class="primary-button" @click="saveSettings({ settings: formData })">
      Apply
    </UiButton>
  </footer>
</template>

<style scoped lang="postcss">
.controls {
  display: grid;
  grid-template-columns: max-content 1fr;
  row-gap: var(--size-2);
  align-items: center;

  padding: var(--size-3);

  border: var(--fancy-border);

  > legend {
    grid-column: 1 / -1;
    font-size: var(--font-size-4);
  }
}

section {
  overflow-y: auto;
  max-height: 60vh;
  max-height: 60dvh;
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  margin-block-start: var(--size-3);
}
</style>
