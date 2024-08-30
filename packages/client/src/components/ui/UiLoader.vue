<script setup lang="ts">
import { neutralHealingMystic } from '@game/sdk/src/card/cards/neutral/healing_mystic';
</script>

<template>
  <div class="loader">
    <CardSprite :sprite-id="neutralHealingMystic.spriteId" animation="run" />
  </div>
</template>

<style scoped lang="postcss">
.loader {
  position: relative;
  aspect-ratio: 1;
  width: 128px;
  &::after {
    content: '';

    position: absolute;
    z-index: 1;
    inset: 0;

    opacity: 0.75;
    background: radial-gradient(
      circle at center,
      transparent,
      blue 20%,
      cyan 50%,
      transparent 70%
    );
    mix-blend-mode: screen;

    animation: var(--animation-blink);

    mask-image: linear-gradient(to right, hsl(0 0 0 / 0.5), hsl(0 0 0 / 0.5));
  }
  > * {
    pointer-events: none;
    translate: 10px -10px;
    scale: 2;
    height: 75%;
  }
}
</style>
