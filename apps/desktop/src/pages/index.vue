<script setup lang="ts">
const sessionId = useSessionId();

until(sessionId)
  .not.toBe(null)
  .then(() => {
    navigateTo('/play');
  });
</script>
<template>Authenticating...</template>
