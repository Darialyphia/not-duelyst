<script
  setup
  lang="ts"
  generic="
    TMultiple extends boolean,
    TValue extends string | number | boolean | Record<string, any>,
    TItem,
    TDefault extends TMultiple extends true ? TValue[] : TValue
  "
>
const {
  options,
  displayValue,
  defaultValue = '',
  multiple
} = defineProps<{
  options: Array<{ label: string; value: TValue; item?: TItem }>;
  displayValue?: (val: TDefault) => string;
  defaultValue?: TDefault;
  multiple?: TMultiple;
  placeholder?: string;
}>();

const selected = defineModel<TMultiple extends true ? TValue[] : TValue>({
  required: true
});
</script>

<template>
  <ComboboxRoot
    v-model="selected as any"
    class="ui-combobox-root"
    :default-value="defaultValue as any"
    :display-value="displayValue"
    :multiple
  >
    <ComboboxAnchor class="anchor">
      <ComboboxInput :placeholder />
      <ComboboxTrigger>
        <Icon name="mdi:chevron-down" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal>
      <ComboboxContent position="popper" as-child align="start">
        <div class="ui-comboox-content">
          <ComboboxViewport class="viewport">
            <ComboboxItem
              v-for="(option, index) in options"
              :key="index"
              :value="option.value"
              class="item"
            >
              <slot name="option" :option="option">
                {{ option.label }}
              </slot>
            </ComboboxItem>
          </ComboboxViewport>
        </div>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<style scoped lang="postcss">
:global(.ui-combobox-root) {
  position: relative;
}

.anchor {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  justify-content: between;

  width: 100%;
  max-inline-size: 100%;
  padding: var(--size-2) var(--size-3);

  line-height: 1;

  background-color: var(--surface-1);
  border: solid 1px var(--border-dimmed);
  border-radius: var(--radius-1);

  &:hover {
    background-color: var(--surface-3);
  }

  &:focus-within {
    background-color: var(--surface-3);
    outline: solid var(--border-size-2) var(--primary);
    outline-offset: 5px;
  }

  & > input {
    width: inherit;
    background-color: transparent;

    &:focus {
      outline: none;
    }
  }
}

.ui-comboox-content {
  z-index: 10;

  width: max-content;
  max-height: 300px;
  margin-top: 8px;
  padding-block: var(--size-2);

  background-color: var(--surface-2);
  border: solid var(--border-size-1) var(--border-dimmed);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);
}

.item {
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  padding: var(--size-4) var(--size-5);
  &[data-disabled] {
    pointer-events: none;
    opacity: 0.5;
  }
  &[data-highlighted] {
    color: var(--text-on-primary);
    background-color: var(--primary);
    outline: none;
  }
  &[data-state='checked'] {
    color: var(--text-on-primary);
    background-color: var(--primary-dark);
    border-top: solid 1px hsl(var(--color-text-on-primary-hsl) / 0.2s);
    outline: none;
  }
}
</style>
