<script setup lang="ts">
import { config } from '@game/sdk';
definePageMeta({
  name: 'ClientHome',
  pageTransition: {
    name: 'client-home',
    mode: 'out-in',
    appear: true
  }
});
</script>

<template>
  <div class="page">
    <ProfileButton class="fixed top-6 left-2" />

    <MainNavigation class="pl-9 pt-12" />

    <section class="fancy-surface fancy-scrollbar">
      <ContentDoc :path="`/${config.VERSION}`" :head="false" />

      <NuxtLink :to="{ name: 'PatchNotesList' }" class="underline" target="_blank">
        Previous patch notes
      </NuxtLink>
    </section>

    <ClientOnly>
      <GrantedCardsModal />
    </ClientOnly>
  </div>
</template>

<style lang="postcss">
.client-home-enter-active,
.client-home-leave-active {
  transition: all 0.3s;
}
.client-home-enter-from,
.client-home-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
.page {
  display: grid;
  grid-template-columns: 6fr minmax(var(--size-xs), 80ch);
  gap: var(--size-7);

  min-height: 100vh;
  padding-inline: var(--size-8);
}

section {
  overflow-y: auto;
  max-height: 80dvh;
  margin-block: var(--size-8);
  line-height: 1.8;
}
</style>
