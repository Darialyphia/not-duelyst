<script setup lang="ts">
import { api } from '@game/api';
import { merge } from 'lodash-es';
import { getDefaultSettings } from '../utils/settings';

const emit = defineEmits<{
  close: [];
}>();

const { data: settings } = useConvexAuthedQuery(api.users.settings, {}, { ssr: false });
const { mutate: saveSettings } = useConvexAuthedMutation(api.users.saveSettings, {
  onSuccess() {
    emit('close');
  }
});

const formData = reactive(getDefaultSettings());

const onSubmit = () => {
  saveSettings({ settings: formData });
};

until(settings)
  .not.toBeUndefined()
  .then(() => {
    merge(formData, settings.value);
  });
</script>

<template>
  <form @submit.prevent="onSubmit">
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
          <UiSliderInput
            v-model="formData.sound.musicVolume"
            label="sound effects volume"
            class="w-full"
          />
          <label>Music</label>
          <UiSliderInput
            v-model="formData.sound.sfxVolume"
            label="sound effects volume"
            class="w-full"
          />
        </fieldset>

        <fieldset>
          <legend>Accessibility</legend>
          <label>Color coded units</label>
          <UiRadioGroup
            v-model="formData.a11y.colorCodeUnits"
            class="mb-3"
            :options="[
              {
                id: 'color-coded-units-off',
                label: 'Off',
                value: COLOR_CODED_UNITS.OFF
              },
              {
                id: 'color-coded-units-subtle',
                label: 'Subtle',
                value: COLOR_CODED_UNITS.SUBTLE
              },
              {
                id: 'color-coded-units-strong',
                label: 'Strong',
                value: COLOR_CODED_UNITS.STRONG
              }
            ]"
          />
          <label>Reduced motions</label>
          <UiSwitch v-model:checked="formData.a11y.reducedMotions" />
        </fieldset>

        <fieldset>
          <legend>Visual</legend>
          <label>Dynamic lighting</label>
          <UiSwitch v-model:checked="formData.fx.dynamicLighting" />
          <label>Shadows</label>
          <UiSwitch v-model:checked="formData.fx.shadows" />
          <label>Tint strength</label>
          <UiSliderInput
            v-model="formData.fx.tintStrength"
            label="sound effects volume"
            class="w-full"
          />
        </fieldset>
        <fieldset>
          <legend>Interface</legend>

          <label>3D cards</label>
          <div class="flex flex-col gap-2">
            <UiSwitch v-model:checked="formData.ui.cardsWith3D" />
            <p class="text-00">
              (Turning this off can fix issues with blurry images in some browsers)
            </p>
          </div>
          <label>Show unit stats</label>
          <UiRadioGroup
            v-model="formData.ui.displayUnitsStats"
            class="mb-3"
            :options="[
              {
                id: 'units-stats-hover-on-top',
                label: 'always hidden',
                value: DISPLAY_UNITS_STATS.NEVER
              },
              {
                id: 'units-stats-always',
                label: 'always visible',
                value: DISPLAY_UNITS_STATS.ALWAYS
              },
              {
                id: 'units-stats-hover-only',
                label: 'hidden, visible on hover',
                value: DISPLAY_UNITS_STATS.HOVER_ONLY
              }
            ]"
          />

          <!-- <label>Show unit names</label>
          <UiRadioGroup
            v-model="formData.ui.displayUnitsNames"
            :options="[
              {
                id: 'units-names-never',
                label: 'never',
                value: DISPLAY_UNITS_NAMES.NEVER
              },
              {
                id: 'units-names-hover-only',
                label: 'on hover only',
                value: DISPLAY_UNITS_NAMES.HOVER_ONLY
              },
              {
                id: 'units-names-always',
                label: 'always',
                value: DISPLAY_UNITS_NAMES.ALWAYS
              }
            ]"
          /> -->
        </fieldset>
      </div>
    </section>

    <footer>
      <UiButton type="button" class="ghost-button" @click="emit('close')">
        Cancel
      </UiButton>
      <UiButton class="primary-button">Apply</UiButton>
    </footer>
  </form>
</template>

<style scoped lang="postcss">
fieldset {
  user-select: none;

  display: grid;
  grid-template-columns: max-content 1fr;
  row-gap: var(--size-4);
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

@container (max-width: 60rem) {
  section {
    display: block;
  }
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  margin-block-start: var(--size-3);
}

pre {
  overflow-y: auto;
  height: 300px;
}
</style>
