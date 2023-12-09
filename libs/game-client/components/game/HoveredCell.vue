<script setup lang="ts">
const { assets } = useGame();

const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSprite('hovered_cell'))
);
</script>

<template>
  <animated-sprite
    :x="0"
    :y="CELL_SIZE / 2"
    :event-mode="'none'"
    :anchor="0.5"
    playing
    :textures="textures"
  />
</template>
