<script setup lang="ts">
import type { Cell } from '@game/sdk';

const { cell } = defineProps<{ cell: Cell }>();
</script>

<template>
  <DangerHighlight :cell="cell" />
  <MovementHighlight :cell-id="cell.id" />
  <SummonHighlight :cell="cell" />
  <FollowupHighlight :cell="cell" />
</template>
