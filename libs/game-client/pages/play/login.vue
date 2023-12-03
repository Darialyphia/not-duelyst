<script setup lang="ts">
import { SignIn } from "vue-clerk";

definePageMeta({
  middleware: ["public"],
});
</script>

<template>
  <div>
    <SignIn after-sign-in-url="/play" />
  </div>
</template>
