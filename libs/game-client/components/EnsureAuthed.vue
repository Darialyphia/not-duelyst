<script setup lang="ts">
const { isAuthenticated } = useConvexAuth();

onServerPrefetch(async () => {
  await until(isAuthenticated).toBe(true);
});
</script>

<template>
  <slot v-if="isAuthenticated" />
</template>
