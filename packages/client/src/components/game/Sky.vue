<script setup lang="ts">
import sky1 from '@/assets/backgrounds/sky-1.png';
import sky2 from '@/assets/backgrounds/sky-2.png';
import sky4 from '@/assets/backgrounds/sky-4.png';
import { diffuseGroup, normalGroup } from '@pixi/lights';
import { throttle } from 'lodash-es';

import { onTick, useApplication, useScreen } from 'vue3-pixi';

const app = useApplication();
const screen = useScreen();

const SKY_SIZE = { x: 576, y: 324 };
const scaleY = ref(app.value.view.height / SKY_SIZE.y);

const foregroundPosition = reactive({ x: 0, y: 0 });
const backgroundPosition = reactive({ x: 0, y: 0 });
const foregroundStep = 0.04;
const backgroundStep = 0.02;

onTick(() => {
  foregroundPosition.x = (foregroundPosition.x + foregroundStep) % screen.value.width;
  backgroundPosition.x = (backgroundPosition.x + backgroundStep) % screen.value.width;
  scaleY.value = app.value.view.height / SKY_SIZE.y;
});

const { settings } = useUserSettings();
</script>

<template>
  <container
    :ref="
      (el: any) => {
        if (!el) return;
        if (settings.fx.dynamicLighting) {
          el.parentGroup = diffuseGroup;
        }
      }
    "
  >
    <tiling-sprite
      :texture="sky1"
      :width="screen.width"
      :height="screen.height"
      :scale="scaleY"
      event-mode="static"
    />
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

  <container
    v-if="settings.fx.dynamicLighting"
    :ref="
      (el: any) => {
        if (!el) return;
        el.parentGroup = normalGroup;
      }
    "
  >
    <tiling-sprite
      :texture="sky1"
      :width="screen.width"
      :height="screen.height"
      :scale="scaleY"
      event-mode="static"
    />
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
