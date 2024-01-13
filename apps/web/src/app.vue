<script setup lang="ts">
const colorMode = useColorMode();

colorMode.preference = 'dark';
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
