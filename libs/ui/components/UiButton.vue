<script setup lang="ts">
import type { StyleProp } from '../utils/types';

type ButtonStyleVariables =
  | '--d-button-color'
  | '--d-button-bg'
  | '--d-button-hover-color'
  | '--d-button-hover-bg'
  | '--d-button-focus-color'
  | '--d-button-focus-bg'
  | '--d-button-disabled-color'
  | '--d-button-disabled-bg'
  | '--d-button-size'
  | '--d-button-weight'
  | '--d-button-border-color'
  | '--d-button-border-size'
  | '--d-button-radius';

export type ButtonProps = {
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isInline?: boolean;
  isCta?: boolean;
  style?: StyleProp<ButtonStyleVariables>;
};

const {
  isLoading = false,
  leftIcon,
  rightIcon,
  isInline,
  isCta,
  style = {}
} = defineProps<ButtonProps>();

const attrs = useAttrs();

const tag = computed(() => {
  if (attrs.href) return 'a';

  return 'button';
});
</script>

<template>
  <component
    :is="tag"
    class="d-button"
    :class="{
      'is-inline': isInline,
      'is-cta': isCta,
      'is-loading': isLoading
    }"
    :style="style"
    :disabled="attrs.disabled || isLoading"
  >
    <Icon v-if="leftIcon && !isLoading" :name="leftIcon" aria-hidden="true" />

    <!-- <UiSpinner v-if="isLoading" /> -->
    <slot />

    <Icon v-if="rightIcon && !isLoading" :name="rightIcon" aria-hidden="true" />
  </component>
</template>

<style scoped lang="postcss">
@import 'open-props/media';

@layer components {
  .d-button {
    --_d-button-size: var(--d-button-size, var(--font-size-1));
    --_d-button-weight: var(--d-button-weight, var(--font-weight-6));
    --_d-button-border-color: var(--d-button-border-color, transparent);
    --_d-button-border-size: var(--d-button-border-size, var(--border-size-1));
    --_d-button-radius: var(--d-button-radius, var(--radius-2));

    --_d-button-color: var(--d-button-color, white);
    --_d-button-bg: var(--d-button-bg, var(--gray-10));

    --_d-button-hover-color: var(--d-button-hover-color, var(--_d-button-color));
    --_d-button-hover-bg: var(--d-button-hover-bg, var(--_d-button-bg));

    --_d-button-focus-color: var(--d-button-focus-color, var(--_d-button-color));
    --_d-button-focus-bg: var(--d-button-focus-bg, var(--_d-button-bg));

    --_d-button-disabled-color: var(--d-button-color, var(--color-on-disabled));
    --_d-button-disabled-bg: var(--d-button-bg, var(--color-disabled));

    cursor: pointer;

    display: flex;
    gap: var(--size-2);
    align-items: center;
    justify-content: center;

    width: fit-content;
    padding: var(--size-2-em) var(--size-3-em);

    font-size: var(--_d-button-size);
    font-weight: var(--_d-button-weight);
    color: var(--_d-button-color);
    white-space: nowrap;
    vertical-align: middle;

    background-color: var(--_d-button-bg);
    border: solid var(--_d-button-border-size) var(--_d-button-border-color);
    border-radius: var(--_d-button-radius);

    &:disabled {
      cursor: not-allowed;
      color: var(--_d-button-disabled-color);
      background-color: var(--_d-button-disabled-bg);
    }

    &,
    &:hover {
      text-decoration: none;
    }

    &:hover &:active {
      transform: scale(0.98);
      transition: transform 0.2s;
    }

    &:focus-visible {
      color: var(--_d-button-focus-color);
      background-color: var(--_d-button-focus-bg);
    }
    &.is-inline {
      display: inline-flex;
    }

    &.is-cta {
      width: 100%;
    }

    & > .icon {
      display: block;
      flex-shrink: 0;
      aspect-ratio: 1;
      font-size: var(--font-size-4);
    }

    @media (--mouse) {
      &:hover:not(:disabled) {
        color: var(--_d-button-hover-color);
        background-color: var(--_d-button-hover-bg);
      }
    }
  }
}
</style>
