<script setup lang="ts">
import type { MapEditorLayer } from '~/composables/useMapEditor';

const { layer } = defineProps<{ layer: MapEditorLayer }>();
</script>

<template>
  <MapEditorCell
    v-for="cell in layer.cells"
    :key="`${cell.position.x}:${cell.position.y}`"
    :cell="cell"
    :layer="layer"
  />
</template>
