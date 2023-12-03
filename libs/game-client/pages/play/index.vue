<script setup lang="ts">
import { useClerkProvide, useUser, SignOutButton } from 'vue-clerk';

definePageMeta({
  middleware: ['auth']
});

const { user } = useUser();
</script>
<template>
  <div>
    <h1>Welcome to hero clash</h1>
    <SignOutButton @sign-out="navigateTo('/play/login')" />
    <GameView />
    <pre v-if="user">{{ user }}</pre>
    <div v-else>Loading user info...</div>
  </div>
</template>
