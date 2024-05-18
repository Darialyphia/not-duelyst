<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'ClientHome',
  pageTransition: {
    name: 'client-home',
    mode: 'out-in',
    appear: true
  }
});

const isSettingsOpened = ref(false);
const session = useSession();

const { mutate: signOff } = useConvexAuthedMutation(api.auth.signOff, {
  onSuccess() {
    session.value = null;
    navigateTo({ name: 'Login' });
  }
});
</script>

<template>
  <div class="page">
    <nav>
      <ul class="grid gap-2">
        <li><NuxtLink :to="{ name: 'SelectGameMode' }">Play</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'WatchList' }">Watch</NuxtLink></li>
        <li><button @click="isSettingsOpened = true">Settings</button></li>
        <li><button @click="signOff({})">Sign Off</button></li>
      </ul>
    </nav>
    <UiModal v-model:is-opened="isSettingsOpened" title="Settings">
      <SettingsForm @close="isSettingsOpened = false" />
    </UiModal>

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
  place-content: center;
  min-height: 100vh;
}

li > * {
  position: relative;

  display: block;

  padding: 0;

  font-size: var(--font-size-5);
  text-align: left;
  text-shadow: black 0px 4px 1px;
  &::after {
    content: '';

    position: absolute;
    bottom: -5px;
    left: 50%;

    width: 0;
    height: 3px;

    background-color: var(--primary);

    transition:
      width 0.2s,
      left 0.2s;
  }

  &:hover::after {
    left: 0;
    width: 100%;
  }
}
</style>
