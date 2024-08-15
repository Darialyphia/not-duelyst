<script setup lang="ts">
import type { TooltipContentProps } from 'radix-vue';

export type UITooltipProps = {
  sideOffset?: number;
  delay?: number;
  side?: TooltipContentProps['side'];
  align?: TooltipContentProps['align'];
  usePortal?: boolean;
};

const {
  sideOffset = 15,
  delay = 400,
  side = 'top',
  align = 'center',
  usePortal = true
} = defineProps<UITooltipProps>();
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot>
      <TooltipTrigger v-slot="triggerProps" as-child>
        <slot name="trigger" v-bind="triggerProps" />
      </TooltipTrigger>
      <TooltipPortal :disabled="!usePortal">
        <TooltipContent
          v-slot="contentProps"
          class="select-none"
          :side-offset="sideOffset"
          :side="side"
          :align="align"
        >
          <slot v-bind="contentProps" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
