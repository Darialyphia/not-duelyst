<script setup lang="ts">
import { api } from "@hc/api";

const config = useAppConfig();
const client = useConvexClient();

const users = ref<any[] | null>(null);
client.onUpdate(api.users.get, {}, (update) => {
  users.value = update;
});

onServerPrefetch(async () => {
  users.value = await client.querySSR(api.users.get, {});
});
</script>

<template>
  <div>
    <h2>Game view</h2>
    <pre>{{ users }}</pre>
  </div>
</template>
