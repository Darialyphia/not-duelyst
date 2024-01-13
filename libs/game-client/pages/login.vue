<script setup lang="ts">
import { SignIn } from 'vue-clerk';

definePageMeta({
  middleware: ['public'],
  name: 'Login'
});
</script>

<template>
  <div class="grid place-content-center h-screen">
    <SignIn after-sign-in-url="/play" />
  </div>
</template>
