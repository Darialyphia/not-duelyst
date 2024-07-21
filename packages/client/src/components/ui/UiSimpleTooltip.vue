<script setup lang="ts">
import type { UITooltipProps } from './UiTooltip.vue';

const {
  sideOffset = 0,
  text,
  ...otherProps
} = defineProps<UITooltipProps & { text: string }>();

const passthroughProps = computed(() => ({
  sideOffset,
  ...otherProps
}));
</script>

<template>
  <UiTooltip v-bind="passthroughProps">
    <template #trigger>
      <slot />
    </template>
    <div class="ui-simple-tooltip">
      {{ text }}
      <TooltipArrow class="ui-simple-tooltip-arrow" :width="12" :height="12" />
    </div>
  </UiTooltip>
</template>

<style scoped lang="postcss">
:global(.ui-simple-tooltip-arrow) {
  fill: var(--surface-4);
}

.ui-simple-tooltip {
  padding: var(--size-2);
  font-size: var(--font-size-0);
  background-color: var(--surface-4);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>
