<script setup lang="ts"></script>

<template>
  <div class="loader">
    <img src="/assets/ui/mystic_loading.gif" />
  </div>
</template>

<style scoped lang="postcss">
.loader {
  position: relative;
  aspect-ratio: 1;
  width: 128px;
  filter: drop-shadow(0 15px hsl(0 0 0 / 0.8));
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
