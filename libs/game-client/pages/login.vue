<script setup lang="ts">
import { SignIn } from 'vue-clerk';

definePageMeta({
  middleware: ['public'],
  name: 'Login'
});
</script>

<template>
  <div>
    <SignIn after-sign-in-url="/play" />
  </div>
</template>
