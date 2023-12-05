<script setup lang="ts">
const isDark = useDarkMode();
isDark.value = true;
</script>
<template>
  <ClientOnly>
    <StandAloneGame />

    <template #fallback>
      <div />
    </template>
  </ClientOnly>
</template>
