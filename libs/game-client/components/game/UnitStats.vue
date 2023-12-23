<script setup lang="ts">
import type { Entity } from '@hc/sdk/src';
import type { Container } from 'pixi.js';
import { clamp } from '@hc/shared';

const { entity } = defineProps<{ entity: Entity }>();

const { assets } = useGame();
const spritesheet = assets.getSprite('unit-stats');

const textures = createSpritesheetFrameObject('idle', spritesheet);

const COLORS = {
  hp: '#a7ed00',
  ap: '#00b9ff',
  attack: '#ff2245',
  defense: '#fffc00'
} as const;

const { autoDestroyRef } = useAutoDestroy();
const ui = useGameUi();

// ts in unhappy if we type the parameter, because vue expects fucntion refs to take a VNode as argument
// However, in vue3-pixi, the behavior is different
const containerRef = (_container: any) => {
  const container = _container as Container;
  if (!container) return;
  if (container.parentLayer) return;
  if (!ui.layers.ui.value) return;
  autoDestroyRef(container, 100);

  container.parentLayer = ui.layers.ui.value;
};
</script>

<template>
  <container :ref="containerRef" event-mode="none">
    <animated-sprite :textures="textures" :anchor="0.5" :y="CELL_SIZE * 1.125">
      <text
        :anchor="0.5"
        :style="{ fill: COLORS.hp, fontSize: 40, fontFamily: 'monospace' }"
        :x="-CELL_SIZE / 2 + 8"
        :y="-CELL_SIZE / 2 + 8"
        :scale="0.25"
      >
        {{ entity.hp }}
      </text>
      <text
        :anchor="0.5"
        :style="{ fill: COLORS.ap, fontSize: 40, fontFamily: 'monospace' }"
        :x="+CELL_SIZE / 2 - 8"
        :y="-CELL_SIZE / 2 + 8"
        :scale="0.25"
      >
        {{ entity.ap }}
      </text>
      <text
        :style="{
          fill: COLORS.attack,
          fontSize: 40,
          fontFamily: 'monospace'
        }"
        :anchor="0.5"
        :x="-CELL_SIZE / 2 + 8"
        :y="CELL_SIZE / 2 - 8"
        :scale="0.25"
      >
        {{ entity.attack }}
      </text>
      <text
        :style="{
          fill: COLORS.defense,
          fontSize: 40,
          fontFamily: 'monospace'
        }"
        :anchor="0.5"
        :x="+CELL_SIZE / 2 - 8"
        :y="CELL_SIZE / 2 - 8"
        :scale="0.25"
      >
        {{ entity.defense }}
      </text>
    </animated-sprite>
  </container>
</template>
