<script setup lang="ts">
const { cell } = defineProps<{ cell: CellViewModel }>();
</script>

<template>
  <DangerHighlight :cell="cell" />
  <MovementHighlight :cell="cell" />
  <SummonHighlight :cell="cell" />
  <TargetingHighlight :cell="cell" />
  <PathArrowHighlight :cell="cell" />
</template>
