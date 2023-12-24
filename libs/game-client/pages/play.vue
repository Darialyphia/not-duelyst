<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen'
});
</script>

<template>
  <div>
    <UsernameModal />
    <CurrentGameModal />
    <NuxtPage />
  </div>
</template>
