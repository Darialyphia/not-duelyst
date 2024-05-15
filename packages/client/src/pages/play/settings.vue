<script setup lang="ts">
definePageMeta({
  name: 'Settings'
});
</script>

<template>
  <div class="h-screen grid place-content-center">
    <div class="fancy-surface">
      <SettingsForm @close="navigateTo({ name: 'ClientHome' })" />
    </div>
  </div>
</template>
