<script setup lang="ts">
import OnboardingModal from '~/components/OnboardingModal.vue';

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
    <OnboardingModal />
    <NuxtPage />
  </div>
</template>

<style scoped lang="postcss">
.root {
  min-height: 100vh;
  background: url('/assets/backgrounds/mountain.png');
  background-attachment: fixed;
  background-size: cover;
}
</style>
