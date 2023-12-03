<script setup lang="ts">
import { api } from '@hc/api';

const { data: users } = useConvexQuery(api.users.get, {});
</script>

<template>
  <div>
    <h2>Game view</h2>
    <pre>{{ users }}</pre>
  </div>
</template>
