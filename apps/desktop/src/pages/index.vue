<script setup lang="ts">
import { useUser } from 'vue-clerk';

const user = useUser();
until(user.isLoaded)
  .toBe(true)
  .then(() => {
    navigateTo('/play');
  });
</script>
<template>Authenticating...</template>
