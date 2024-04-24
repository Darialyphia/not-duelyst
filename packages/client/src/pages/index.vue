<script setup lang="ts">
definePageMeta({
  layout: 'default'
});
</script>

<template>
  <div class="hero">
    <div class="fancy-surface container">
      <div class="flex gap-4">
        <NuxtLink v-slot="{ href, navigate }" to="/play" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Play now
          </UiButton>
        </NuxtLink>
        <NuxtLink v-slot="{ href, navigate }" to="/signup" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Get started
          </UiButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
