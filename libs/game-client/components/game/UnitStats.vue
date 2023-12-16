<script setup lang="ts">
import type { Entity } from '@hc/sdk/src';

const { entity } = defineProps<{ entity: Entity }>();

const { assets } = useGame();
const spritesheet = assets.getSprite('unit-stats');
const textures = createSpritesheetFrameObject('idle', spritesheet);

const COLORS = {
  hp: '#a7ed00',
  ap: '#00b9ff',
  attack: '#e93100',
  defense: '#fffc00'
} as const;

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <container :ref="autoDestroyRef">
    <animated-sprite
      event-mode="none"
      :textures="textures"
      :anchor="0.5"
      :y="CELL_SIZE * 1.125"
    >
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
