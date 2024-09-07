<template>
  <main>
    <section class="container" style="--container-size: var(--size-sm)">
      <h1>
        <img src="/assets/ui/logo2@3x.png" />
        <span class="sr-only">Not Duelyst</span>
      </h1>

      <section class="fancy-surface">
        <slot />
      </section>

      <footer class="text-center text-00 mt-2">
        <NuxtLink :to="{ name: 'Home' }">Go to the Darialyst website</NuxtLink>
      </footer>
    </section>
  </main>
</template>

<style scoped lang="postcss">
@keyframes auth-slide {
  from {
    transform: var(--transform);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

:is(h1, section) {
  opacity: 0;
  animation: auth-slide 0.5s ease-out forwards;
}

@keyframes auth-layout {
  from {
    filter: brightness(0);
  }
  50% {
    filter: brightness(100%);
  }
  to {
    filter: brightness(100%);
  }
}

h1 {
  --transform: translateY(calc(-1 * var(--size-7)));

  width: fit-content;
  margin: 0 auto var(--size-7);
  animation-delay: 1.3s;
}

section {
  --transform: translateY(var(--size-7));

  border-radius: var(--radius-3);
  animation-delay: 0.8s;
}

main {
  height: 100dvh;
  padding-block-start: 10dvh;

  background: url('/assets/backgrounds/main-bg.jpg');
  background-attachment: fixed;
  background-size: cover;
  filter: brightness(0);

  animation: auth-layout 2s ease-out forwards;
}
</style>
