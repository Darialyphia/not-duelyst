<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'PatchNotesList'
});

defineRouteRules({
  ssr: false
});

const route = useRoute();

const { data: navigation } = await useAsyncData('navigation', () =>
  fetchContentNavigation()
);

const assets = useAssetsProvider();
assets.load();
</script>

<template>
  <main class="container">
    <nav class="fancy-surface">
      <h2>Patch notes</h2>
      <ul>
        <li v-for="item in navigation" :key="item._path">
          <NuxtLink :to="`/patch-notes${item._path}`">
            {{ item._path.replace('/', 'Version ') }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </main>
</template>

<style scoped lang="postcss">
nav {
  > div {
    position: sticky;
    top: 0;
  }

  a {
    text-decoration: underline;
  }
}
</style>
