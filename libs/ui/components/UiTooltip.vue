<script setup lang="ts">
const { sideOffset = 15, delay = 400 } = defineProps<{
  sideOffset?: number;
  delay?: number;
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
        >
          <slot v-bind="contentProps" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
