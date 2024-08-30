<script setup lang="ts">
import { VERSION } from '@game/sdk';
import { mapRange } from '@game/shared';
definePageMeta({
  name: 'ClientHome',
  pageTransition: {
    name: 'client-home',
    mode: 'out-in',
    appear: true
  }
});

const { isMobile } = useResponsive();

useEventListener('mousemove', e => {
  document.body.style.setProperty(
    '--app-bg-offset-x',
    `${mapRange(e.clientX, [0, window.innerWidth], [-30, 30])}px`
  );
  document.body.style.setProperty(
    '--app-bg-offset-y',
    `${mapRange(e.clientY, [0, window.innerHeight], [-20, 10])}px`
  );
});
</script>

<template>
  <div class="page">
    <ProfileButton v-if="!isMobile" class="fixed top-6 left-10" />

    <MainNavigation />

    <section>
      <div class="logo">
        <div />
        <img src="/assets/ui/logo2@3x.png" />
        <div />
      </div>
      <div class="fancy-scrollbar patch-notes">
        <ContentDoc :path="`/${VERSION}`" :head="false" class="markdown" />

        <NuxtLink :to="{ name: 'PatchNotesList' }" class="underline" target="_blank">
          Previous patch notes
        </NuxtLink>
      </div>
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
  grid-template-columns: 6fr minmax(var(--size-xs), 75ch);
  gap: var(--size-7);

  min-height: 100vh;
  padding-inline: var(--size-8);

  @screen lt-lg {
    grid-template-columns: 6fr minmax(var(--size-xs), 50ch);
    padding-inline: var(--size-6);
  }
}

section {
  display: grid;
  grid-template-rows: auto 1fr;
  justify-items: center;

  max-height: 90dvh;
  padding-block-start: var(--size-6);
}

.patch-notes {
  overflow-y: auto;

  width: 100%;
  padding: var(--size-6);

  line-height: 1.8;

  background: hsl(0 0 0 / 0.6);

  @screen lg {
    margin-block: var(--size-8);
  }
}

.logo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  > :is(div:first-of-type, div:last-of-type) {
    width: 50%;
    height: 2px;
    background-color: white;
  }

  > div:first-of-type {
    justify-self: end;
  }
  > div:last-of-type {
    justify-self: start;
  }
}

img {
  @screen lt-lg {
    justify-self: end;
    width: 5rem;
    height: auto;
  }
}
</style>
