<script setup lang="ts"></script>

<template>
  <graphics
    @render="
      g => {
        console.log('render graphics');
        g.clear();
        g.beginFill(0xde3249);
        g.drawCircle(100, 100, 200);
        g.endFill();
      }
    "
  ></graphics>
</template>
