<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen',
  colorMode: 'dark',
  pageTransition: { mode: 'out-in' }
});
</script>

<template>
  <div class="root">
    <CurrentGameModal />
    <UsernameModal />
    <NuxtPage />
  </div>
</template>

<style scoped lang="postcss">
.root {
  min-height: 100vh;
  background-attachment: fixed;
  background-size: cover;
}
</style>
