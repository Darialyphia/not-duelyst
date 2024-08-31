<script setup lang="ts" generic="T extends string, TItem">
import type { SelectPortalProps } from 'radix-vue';
const {
  options,
  placeholder = 'Select a value',
  usePortal = true,
  to
} = defineProps<{
  options: Array<{ label: string; value: T; disabled?: boolean; item?: TItem }>;
  placeholder?: string;
  usePortal?: boolean;
  to?: SelectPortalProps['to'];
}>();

const selected = defineModel<T | undefined>('modelValue', { required: true });

const selectedLabel = computed(
  () => options.find(o => o.value === selected.value)?.label
);
</script>

<template>
  <SelectRoot v-model="selected">
    <InteractableSounds>
      <SelectTrigger :placeholder class="ui-select-trigger" v-bind="$attrs">
        <SelectValue :placeholder="placeholder">
          {{ selectedLabel }}
        </SelectValue>
        <Icon name="radix-icons:chevron-down" />
      </SelectTrigger>
    </InteractableSounds>
    <SelectPortal :disabled="!usePortal" :to="to">
      <SelectContent :side-offset="5" as-child style="z-index: 2">
        <div class="ui-select-content fancy-scrollbar">
          <SelectViewport as-child>
            <SelectGroup>
              <SelectItem
                v-for="(option, index) in options"
                :key="index"
                class="select-item"
                :value="option.value"
                :disabled="option.disabled"
              >
                <SelectItemIndicator>
                  <Icon name="radix-icons:check" />
                </SelectItemIndicator>
                <SelectItemText>
                  <slot name="option" :option="option">{{ option.label }}</slot>
                </SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectViewport>
        </div>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped lang="postcss">
.ui-select-trigger {
  display: flex;
  gap: var(--size-1);
  align-items: center;
  justify-content: space-between;

  height: var(--size-8);
  padding: 0 var(--size-3);

  font-size: var(--font-size-1);
  line-height: 1;

  background-color: var(--surface-1);
  border: solid 1px var(--border-dimmed);
  border-radius: var(--radius-1);

  &:hover {
    background-color: var(--surface-2);
  }

  &:focus-visible {
    outline-color: var(--brand, var(--primary));
    outline-style: solid;
    outline-offset: 5px;
    transition: outline-offset 145ms var(--ease-2);
  }

  &[data-placeholder] {
    font-style: italic;
    color: var(--text-3);
  }
}

.ui-select-content {
  z-index: 999;

  overflow-y: auto;

  background-color: var(--surface-1);
  border: solid var(--border-size-1) var(--border-dimmed);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);
}

.select-item {
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  padding: var(--size-4) var(--size-5);

  font-size: var(--font-size-1);
  line-height: 1;

  &[data-disabled] {
    pointer-events: none;
    opacity: 0.6;
  }

  &[data-highlighted] {
    color: var(--text-on-primary);
    background-color: var(--primary);
  }
}

/* styles.css */
.scroll-area {
  width: 100%;
  height: 100%;
}

.viewport {
  width: 100%;
  height: 100%;
  padding: var(--size-3);
}

.scrollbar {
  width: 4px;
  padding: 5px 2px;
}

.scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}
</style>
