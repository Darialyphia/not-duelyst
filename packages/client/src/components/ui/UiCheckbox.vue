<script setup lang="ts" generic="T">
import { CheckboxIndicator, CheckboxRoot, type CheckboxRootProps } from 'radix-vue';
import { Icon } from '@iconify/vue';

const checked = defineModel<boolean>('checked', { required: true });

const props = defineProps<Omit<CheckboxRootProps, 'checked' | 'asChild'>>();
</script>

<template>
  <label>
    <CheckboxRoot v-model:checked="checked" as-child v-bind="props">
      <div class="root">
        <CheckboxIndicator class="inner">
          <Icon icon="radix-icons:check" />
        </CheckboxIndicator>
      </div>
    </CheckboxRoot>
    <span class="label"><slot /></span>
  </label>
</template>

<style scoped lang="postcss">
.root {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  border: solid 1px var(--primary);
  border-radius: 4px;
  &:hover {
    background-color: var(--grass-3);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px black;
  }
}

.inner {
  color: var(--primary);
}

label {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  line-height: 1;
  color: white;
}
</style>
