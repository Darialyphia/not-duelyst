<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'Home'
});
</script>

<template>
  <main>
    <h2>TODO landing / marketing page</h2>
    <section class="fancy-surface hero">
      <div class="flex gap-4">
        <NuxtLink v-slot="{ href, navigate }" to="/play" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Play now
          </UiButton>
        </NuxtLink>
        <NuxtLink v-slot="{ href, navigate }" to="/signup" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Get started
          </UiButton>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped lang="postcss">
main {
  display: grid;
  grid-template-columns: [breakout-start]1fr [container-start]var(--size-lg) [container-end] 1fr [breakout-end];

  > h2 {
    grid-column: container;
    margin-block-end: var(--size-6);
  }
}

.hero {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  padding-block: var(--size-10);
  > div {
    grid-column: container;
  }
}
</style>
