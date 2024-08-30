<script setup lang="ts">
import { api } from '@game/api';

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
    // Removed the loader code before the SPA got loaded
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
usePresence();
useBgmProvider();

const route = useRoute();

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const isLobbyLinkDisplayed = computed(
  () => me.value?.currentLobby && !['Lobby', 'Game'].includes(route.name as string)
);
</script>

<template>
  <div class="h-full isolate">
    <CurrentGameModal />
    <UsernameModal />
    <OnboardingModal />
    <CurrentFriendlyChallengeModal />
    <NuxtPage v-if="isReady" />
    <FriendsPopover />

    <NuxtLink
      v-if="isLobbyLinkDisplayed"
      v-slot="{ href, navigate }"
      custom
      :to="{ name: 'Lobby', params: { id: me.currentLobby } }"
    >
      <UiButton class="primary-button lobby-link" :href="href" @click="navigate">
        Return to Lobby
      </UiButton>
    </NuxtLink>
  </div>
</template>

<style scoped lang="postcss">
.lobby-link {
  position: fixed;
  bottom: var(--size-8);
  left: var(--size-11);
}
</style>
