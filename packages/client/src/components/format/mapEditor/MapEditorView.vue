<script setup lang="ts">
useMapEditorControls();

const { layers, isPainting } = useMapEditor();
</script>

<template>
  <container @pointerup="isPainting = false">
    <Sky />
    <MapEditorCamera>
      <MapEditorLayer v-for="layer in layers" :key="layer.floor" :layer="layer" />
    </MapEditorCamera>
  </container>
</template>
