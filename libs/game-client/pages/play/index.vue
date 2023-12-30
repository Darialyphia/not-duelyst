<script setup lang="ts">
import { api } from '@hc/api';
import { SignOutButton } from 'vue-clerk';
definePageMeta({
  name: 'ClientHome'
});

const { data: me } = useConvexQuery(api.users.me, {});
</script>
<template>
  <div>
    <h1>Welcome to hero clash, {{ me?.fullName }}</h1>

    <nav>
      <ul>
        <li><NuxtLink :to="{ name: 'Matchmaking' }">Play</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink></li>
        <li><SignOutButton @sign-out="navigateTo('/play/login')" /></li>
      </ul>
    </nav>
  </div>
</template>
