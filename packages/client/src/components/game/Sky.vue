<script setup lang="ts">
import bg from '@/assets/tiles{m}/background.png';
import sky2 from '@/assets/backgrounds/sky-2.png';
import sky4 from '@/assets/backgrounds/sky-4.png';

import { onTick, useApplication, useScreen } from 'vue3-pixi';

const app = useApplication();
const screen = useScreen();

const SKY_SIZE = { x: 576, y: 324 };
const scaleY = app.value.view.height / SKY_SIZE.y;

const foregroundPosition = reactive({ x: 0, y: 0 });
const backgroundPosition = reactive({ x: 0, y: 0 });
const foregroundStep = 0.04;
const backgroundStep = 0.02;
onTick(() => {
  foregroundPosition.x = (foregroundPosition.x + foregroundStep) % screen.value.width;
  backgroundPosition.x = (backgroundPosition.x + backgroundStep) % screen.value.width;
});
</script>

<template>
  <container>
    <tiling-sprite
      :texture="sky2"
      :width="screen.width"
      :height="screen.height"
      :scale="scaleY"
      :tile-position="backgroundPosition"
      event-mode="static"
    />
    <tiling-sprite
      :texture="sky4"
      :width="screen.width"
      :height="screen.height"
      :scale="scaleY"
      :tile-position="foregroundPosition"
      event-mode="static"
    />
    <!-- <tiling-sprite
      :texture="bg"
      :width="screen.width"
      :height="screen.height"
      event-mode="static"
    /> -->
  </container>
</template>
