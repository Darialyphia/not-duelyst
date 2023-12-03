<script setup lang="ts">
import { SignIn } from "vue-clerk";

definePageMeta({
  middleware: ["public"],
});
</script>

<template>
  <div>
    <SignIn />
  </div>
</template>
