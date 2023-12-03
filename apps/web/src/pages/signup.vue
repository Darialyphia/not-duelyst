<script setup lang="ts">
import { SignUp } from "vue-clerk";

definePageMeta({
  middleware: ["public"],
});
</script>

<template>
  <div>
    <SignUp />
  </div>
</template>
