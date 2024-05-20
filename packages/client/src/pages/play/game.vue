<script setup lang="ts">
definePageMeta({
  name: 'Game',
  bgm: BGMS.BATTLE
});
</script>

<template>
  <div class="overflow-hidden" style="background: black">
    <ClientOnly>
      <PvpGame />

      <template #fallback>
        <div class="overflow-hidden h-screen" style="background: black"></div>
      </template>
    </ClientOnly>
  </div>
</template>
