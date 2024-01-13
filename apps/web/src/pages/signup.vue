<script setup lang="ts">
import { SignUp } from 'vue-clerk';

definePageMeta({
  middleware: ['public']
});
</script>

<template>
  <div class="grid place-content-center h-screen">
    <SignUp />
  </div>
</template>
