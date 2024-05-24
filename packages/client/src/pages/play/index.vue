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

const { data: me } = useConvexAuthedQuery(api.users.me, {});
</script>

<template>
  <div class="page">
    <Sound sound="button-hover" :triggers="['mouseenter']">
      <Sound sound="button-click" :triggers="['mousedown']">
        <div>
          <NuxtLink
            v-slot="{ navigate, href }"
            :to="{ name: 'Profile', params: { name: me.fullName } }"
            custom
          >
            <button class="profile-button" :href @click="navigate">
              <img src="/assets/portraits/f1-general.png" />
              {{ me.fullName }}
            </button>
          </NuxtLink>
        </div>
      </Sound>
    </Sound>
    <nav>
      <ul class="grid gap-2">
        <li>
          <Sound sound="button-hover" :triggers="['mouseenter']">
            <Sound sound="button-click" :triggers="['mousedown']">
              <NuxtLink :to="{ name: 'SelectGameMode' }">Play</NuxtLink>
            </Sound>
          </Sound>
        </li>
        <li>
          <Sound sound="button-hover" :triggers="['mouseenter']">
            <Sound sound="button-click" :triggers="['mousedown']">
              <NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink>
            </Sound>
          </Sound>
        </li>
        <li>
          <Sound sound="button-hover" :triggers="['mouseenter']">
            <Sound sound="button-click" :triggers="['mousedown']">
              <NuxtLink :to="{ name: 'WatchList' }">Watch</NuxtLink>
            </Sound>
          </Sound>
        </li>
        <li></li>
        <li>
          <Sound sound="button-hover" :triggers="['mouseenter']">
            <Sound sound="button-click" :triggers="['mousedown']">
              <button @click="isSettingsOpened = true">Settings</button>
            </Sound>
          </Sound>
        </li>
        <li>
          <Sound sound="button-hover" :triggers="['mouseenter']">
            <Sound sound="button-click" :triggers="['mousedown']">
              <button @click="signOff({})">Sign Off</button>
            </Sound>
          </Sound>
        </li>
      </ul>
    </nav>
    <UiModal
      v-model:is-opened="isSettingsOpened"
      title="Settings"
      :style="{ '--ui-modal-size': 'var(--size-lg)' }"
    >
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

.profile-button {
  position: fixed;
  top: var(--size-6);
  left: var(--size-2);

  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-2) var(--size-4);

  font-size: var(--font-size-3);
  line-height: 1;
  text-shadow: black 0px 3px 1px;

  border-radius: var(--radius-3);

  transition: background-color 0.3s;
  > img {
    transition: filter 0.3s;
  }
  &:hover,
  &:focus-visible {
    background-color: hsl(0 0 0 / 0.2);
    > img {
      filter: drop-shadow(6px 6px 5px var(--cyan-5))
        drop-shadow(-6px -6px 5px var(--orange-5));
    }
  }
}
</style>
