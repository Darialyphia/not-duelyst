<script setup lang="ts">
const {
  sideOffset = 15,
  delay = 400,
  side = 'top',
  align = 'center'
} = defineProps<{
  sideOffset?: number;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'end' | 'center';
}>();
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot>
      <TooltipTrigger v-slot="triggerProps" as-child>
        <slot name="trigger" v-bind="triggerProps" />
      </TooltipTrigger>
      <TooltipPortal>
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
