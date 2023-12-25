<script setup lang="ts">
import { SignOutButton } from 'vue-clerk';
import { api } from '@hc/api';
definePageMeta({
  name: 'ClientHome'
});
const { data: me } = useConvexQuery(api.users.me, {});
</script>
<template>
  <div>
    <h1>Welcome to hero clash, {{ me?.fullName }}</h1>

    <NuxtLink :to="{ name: 'Matchmaking' }">Play</NuxtLink>
    <SignOutButton @sign-out="navigateTo('/play/login')" />
  </div>
</template>
