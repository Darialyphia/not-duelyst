<template>
  <main>
    <section class="container" style="--container-size: var(--size-sm)">
      <h1>
        <img src="/assets/ui/logo@2x.png" />
        <span class="sr-only">Not Duelyst</span>
      </h1>

      <section class="fancy-surface">
        <slot />
      </section>
    </section>
  </main>
</template>

<style scoped lang="postcss">
@keyframes login-slide {
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
  animation: login-slide 0.5s ease-out forwards;
}

h1 {
  --transform: translateY(calc(-1 * var(--size-7)));

  width: fit-content;
  margin: 0 auto var(--size-7);
  animation-delay: 0.5s;
}

section {
  --transform: translateY(var(--size-7));

  border-radius: var(--radius-3);
}

main {
  height: 100dvh;
  padding-block-start: 15vh;

  background: url('/assets/backgrounds/mountain.png');
  background-attachment: fixed;
  background-size: cover;
}
</style>
