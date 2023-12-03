<script setup lang="ts">
import { useUser } from "vue-clerk";

definePageMeta({
  middleware: ["auth"],
});

const { user } = useUser();
</script>
<template>
  <div>
    <h1>Welcome to hero clash</h1>
    <pre>{{ user }}</pre>
  </div>
</template>
