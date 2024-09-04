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

    <div class="bottom">
      <FriendsPopover />

      <NuxtLink
        v-if="isLobbyLinkDisplayed"
        v-slot="{ href, navigate }"
        custom
        :to="{ name: 'Lobby', params: { id: me.currentLobby } }"
      >
        <LinkSounds>
          <UiButton class="primary-button lobby-button" :href="href" @click="navigate">
            Return to Lobby
          </UiButton>
        </LinkSounds>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bottom {
  pointer-events: none;

  position: fixed;
  z-index: 1;
  bottom: var(--size-6);
  left: var(--size-6);

  display: flex;
  gap: var(--size-4);
  align-items: center;

  > * {
    pointer-events: auto;
  }
}

.lobby-button {
  box-shadow: 0 3px 0.5rem hsl(var(--gray-11-hsl) / 0.4);
}
</style>
