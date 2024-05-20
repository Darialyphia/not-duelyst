<script setup lang="ts"></script>

<template>
  <main class="fullscreen-layout">
    <slot />
  </main>
</template>

<style scoped lang="postcss">
.fullscreen-layout {
  overflow-y: auto;

  height: 100dvh;

  background: url('/assets/backgrounds/mountain.png');
  background-attachment: fixed;
  background-size: cover;
}
</style>
