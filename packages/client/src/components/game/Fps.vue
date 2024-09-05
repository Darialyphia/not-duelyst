<script setup lang="ts">
import { TextStyle } from 'pixi.js';

const { session } = useGame();

const style = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
const isDev = import.meta.env.DEV;
const { isMobile } = useResponsive();
</script>

<template>
  <container v-if="isDev && !isMobile" :y="0" :x="300">
    <pixi-text
      :x="30"
      :y="30"
      :style="style"
      @click="
        () => {
          console.log(session);
        }
      "
    >
      Debug client session
    </pixi-text>
  </container>
</template>
