<script setup lang="ts">
import { compareSemanticVersions } from '~/utils/semver';

definePageMeta({
  layout: 'default',
  name: 'PatchNotesList'
});

defineRouteRules({
  ssr: false
});

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
  <main class="container">
    <nav class="fancy-surface">
      <h2>Patch notes</h2>
      <ul>
        <li v-for="item in sortedNavigation" :key="item._path">
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
