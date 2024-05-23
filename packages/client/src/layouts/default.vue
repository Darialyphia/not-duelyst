<template>
  <div>
    <header class="container p-3 flex justify-between">
      <h1 class="text-4">
        <NuxtLink to="/">
          <img src="/assets/ui/logo.png" />
          <span class="sr-only">Not Duelyst</span>
        </NuxtLink>
      </h1>

      <nav>
        <ul class="flex gap-3">
          <li>
            <NuxtLink v-slot="{ href, navigate }" to="/play" custom>
              <UiButton :href="href" @click="navigate">Play now</UiButton>
            </NuxtLink>
          </li>

          <li>
            <NuxtLink v-slot="{ href, navigate }" to="/signup" custom>
              <UiButton :href="href" @click="navigate">Get started</UiButton>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
    <slot />
  </div>
</template>

<style scoped lang="postcss">
header {
  padding: var(--size-2);
}

nav a:hover {
  text-decoration: underline;
}

h1:has(a:focus-visible) {
  transform: outlien-offset 0.3;
  outline: solid 2px var(--primary);
  outline-offset: 6px;
}
</style>
