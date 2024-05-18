<script setup lang="ts"></script>

<template>
  <div class="fullscreen-layout">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.fullscreen-layout {
  height: 100dvh;
  background: url('/assets/backgrounds/mountain.png');
  background-attachment: fixed;
  background-size: cover;
}
</style>
