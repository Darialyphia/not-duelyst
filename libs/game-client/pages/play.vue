<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen',
  colorMode: 'dark'
});
</script>

<template>
  <div>
    <UsernameModal />
    <CurrentGameModal />
    <NuxtPage />
  </div>
</template>
