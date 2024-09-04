<script setup lang="ts">
definePageMeta({
  name: 'Game',
  pageTransition: {
    name: 'tutorial',
    mode: 'out-in'
  }
});
</script>

<template>
  <div class="overflow-hidden">
    <PvpGame />
  </div>
</template>

<style lang="postcss">
.game-enter-active {
  transition: all 2s;
}
.game-leave-active {
  transition: all 1s;
}

.game-enter-from,
.game-leave-to {
  filter: brightness(0%);
}
</style>
