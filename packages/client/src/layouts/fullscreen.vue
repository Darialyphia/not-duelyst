<script setup lang="ts"></script>

<template>
  <main class="fullscreen-layout">
    <slot />
  </main>
</template>

<style>
@property --app-bg-offset-x {
  inherits: true;
  initial-value: 0px;
  syntax: '<length>';
}

@property --app-bg-offset-y {
  inherits: true;
  initial-value: 0px;
  syntax: '<length>';
}
body {
  --app-bg-offset-x: 0px;
  --app-bg-offset-y: 0px;
}
</style>
<style scoped lang="postcss">
.fullscreen-layout {
  overflow-y: auto;

  height: 100dvh;

  background: url('/assets/backgrounds/obsidian_woods_cliff.png'),
    url('/assets/backgrounds/obsidian_woods_pillar.png'),
    url('/assets/backgrounds/obsidian_woods_background.jpg');
  background-repeat: no-repeat, no-repeat;
  background-attachment: fixed;
  background-position:
    bottom calc(-20% + var(--app-bg-offset-y)) right calc(80% + var(--app-bg-offset-x)),
    bottom 30% right -8%,
    center;
  background-size:
    110% auto,
    450px 650px,
    cover;

  transition: background-position 0.5s ease-in-out;
}
</style>
