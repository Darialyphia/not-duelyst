<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import { TextStyle, Ticker } from 'pixi.js';

const { ui, session } = useGame();
const fps = ref<number[]>([60]);
const HISTORY_LIMIT = 30;
onTick(() => {
  fps.value.push(Ticker.shared.FPS);
  if (fps.value.length > HISTORY_LIMIT) {
    fps.value.shift();
  }
});

const averageFPS = computed(() => {
  return fps.value.reduce((total, x) => total + x) / fps.value.length;
});

const style = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
const isDev = import.meta.env;
</script>

<template>
  <container :y="225">
    <pixi-text :x="30" :y="15" :style="style">{{ averageFPS.toFixed() }} FPS</pixi-text>
    <pixi-text :x="30" :y="30" :style="style">
      TARGETING MODE: {{ ui.targetingMode }}
    </pixi-text>
    <pixi-text
      :x="30"
      :y="45"
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
