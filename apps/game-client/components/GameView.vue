<script setup lang="ts">
import { api, createApiClient } from "@hc/api";

const config = useAppConfig();
const client = useConvexClient();

const users = ref<any[]>();
client.onUpdate(api.users.get, {}, (update) => {
  users.value = update;
});
</script>

<template>
  <div>
    <h2>Game view</h2>
    <pre>{{ users }}</pre>
  </div>
</template>
