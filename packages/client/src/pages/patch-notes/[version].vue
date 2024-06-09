<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'PatchNotes'
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

const sortedNavigation = computed(() =>
  navigation.value?.toSorted(compareSemanticVersions('_path')).reverse()
);
</script>

<template>
  <main id="patch-notes">
    <nav class="px-5">
      <div class="fancy-surface">
        <h2>Previous Versions</h2>
        <ul>
          <li v-for="item in sortedNavigation" :key="item._path">
            <NuxtLink :to="`/patch-notes${item._path}`">
              {{ item._path.replace('/', 'Version ') }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
    <ContentDoc :path="`/${route.params.version}`" class="markdown" />
  </main>
</template>

<style scoped lang="postcss">
main {
  display: grid;
  grid-template-columns: 1fr var(--size-lg) 1fr;
  gap: var(--size-6);
}

nav {
  > div {
    position: sticky;
    top: 0;
  }
  h2 {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-4);
  }

  a {
    text-decoration: underline;
  }
}
</style>
