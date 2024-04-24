<script setup lang="ts">
import type { Cell } from '@game/sdk';

const { cell } = defineProps<{ cell: Cell }>();
</script>

<template>
  <MovementHighlight :cell-id="cell.id" />
  <DangerHighlight :cell="cell" />
  <SummonHighlight :cell="cell" />
  <FollowupHighlight :cell="cell" />
</template>
