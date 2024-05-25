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
    <ProfileButton class="fixed top-6 left-2" />

    <MainNavigation class="pl-10 pt-12" />

    <section id="main-menu-patch-notes" class="fancy-surface fancy-scrollbar">
      <ContentDoc path="/patch-notes" />
    </section>

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

#main-menu-patch-notes {
  h2,
  h3,
  h4 {
    margin-block: 1em;
    font-weight: var(--font-weight-5);
  }

  li {
    margin-left: var(--size-3);
    list-style: disc;
  }
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
