<script setup lang="ts" generic="T extends string">
const { options, placeholder } = defineProps<{
  options: Array<{ label: string; value: T }>;
  placeholder?: string;
}>();

const selected = defineModel<T>('modelValue', { required: true });
</script>

<template>
  <SelectRoot v-model="selected">
    <SelectTrigger aria-label="rarity" :placeholder class="ui-select-trigger">
      <SelectValue :placeholder="placeholder" />
      <Icon name="radix-icons:chevron-down" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent :side-offset="5" as-child>
        <div class="ui-select-content">
          <SelectViewport as-child>
            <div class="select-viewport">
              <SelectGroup>
                <SelectItem
                  v-for="(option, index) in options"
                  :key="index"
                  class="select-item"
                  :value="option.value"
                >
                  <SelectItemIndicator>
                    <Icon name="radix-icons:check" />
                  </SelectItemIndicator>
                  <SelectItemText>
                    <slot name="option" :option="option">{{ option.label }}</slot>
                  </SelectItemText>
                </SelectItem>
              </SelectGroup>
            </div>
          </SelectViewport>
        </div>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped lang="postcss">
.ui-select-trigger {
  display: inline-flex;
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
  }
}

.ui-select-content {
  overflow: hidden;

  background-color: var(--surface-1);
  border: solid var(--border-size-1) var(--border-dimmed);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);
}

.select-viewport {
  padding: var(--size-3);
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
    opacity: 0.7;
  }

  &[data-highlighted] {
    color: var(--text-on-primary);
    background-color: var(--primary);
  }
}
</style>
