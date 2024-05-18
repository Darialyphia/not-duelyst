<script setup lang="ts">
import OnboardingModal from '~/components/OnboardingModal.vue';

definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen',
  colorMode: 'dark',
  pageTransition: { mode: 'out-in' }
});

const assets = useAssetsProvider();
assets.load();

const isReady = ref(false);
until(assets.loaded)
  .toBe(true)
  .then(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) {
      isReady.value = true;
      return;
    }

    loader.addEventListener('animationend', () => {
      loader.remove();
      isReady.value = true;
    });
    loader.classList.add('loader-fadeout');
  });
</script>

<template>
  <div class="root">
    <CurrentGameModal />
    <UsernameModal />
    <OnboardingModal />

    <NuxtPage v-if="isReady" />
  </div>
</template>

<style scoped lang="postcss">
.root {
  min-height: 100vh;
}
</style>

<style>
.loader-fadeout {
  animation: var(--animation-fade-out);
}
</style>
