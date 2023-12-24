<script setup lang="ts">
import { SignOutButton } from 'vue-clerk';
import { api } from '@hc/api';

definePageMeta({
  middleware: ['auth']
});

const { data: me } = useConvexQuery(api.users.me, {});
</script>
<template>
  <div>
    <h1>Welcome to hero clash, {{ me?.fullName }}</h1>

    <SignOutButton @sign-out="navigateTo('/play/login')" />
  </div>
</template>
