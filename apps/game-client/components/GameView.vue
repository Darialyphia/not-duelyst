<script setup lang="ts">
import { api, createApiClient } from "@hc/api";

const config = useAppConfig();
const client = createApiClient("https://scrupulous-mastodon-328.convex.cloud");

const users = ref<any[]>();
client.onUpdate(api.users.get, {}, (update) => {
  users.value = update;
});
</script>

<template>
  <div>
    <h2>Game view</h2>
    <pre>{{ config.gameClient }}</pre>
    <pre>{{ users }}</pre>
  </div>
</template>
