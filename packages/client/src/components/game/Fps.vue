<script setup lang="ts">
import { TextStyle } from 'pixi.js';

const { session, ui } = useGame();

const style = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
const isDev = import.meta.env.DEV;
</script>

<template>
  <container v-if="isDev" :y="0" :x="300">
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
      Debug session
    </pixi-text>
    <pixi-text :x="30" :y="60" :style="style">
      {{ ui.targetingMode.value }}
    </pixi-text>
  </container>
</template>
