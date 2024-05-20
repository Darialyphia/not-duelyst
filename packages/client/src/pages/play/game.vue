<script setup lang="ts">
definePageMeta({
  name: 'Game',
  bgm: BGMS.BATTLE
});
</script>

<template>
  <div class="overflow-hidden" style="background: black">
    <PvpGame />
  </div>
</template>
