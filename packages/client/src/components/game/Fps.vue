<script setup lang="ts">
import { TextStyle } from 'pixi.js';

const { session } = useGame();

const style = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
const isDev = import.meta.env.DEV;
</script>

<template>
  <container v-if="isDev" :y="0" :x="600">
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
  </container>
</template>
