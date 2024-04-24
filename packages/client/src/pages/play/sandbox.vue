<script setup lang="ts">
definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});
</script>

<template>
  <div class="overflow-hidden" style="background: black">
    <ClientOnly>
      <SandboxGame />

      <template #fallback>
        <div class="overflow-hidden h-screen" style="background: black"></div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave.active {
  transition: all 0.3s;

  .player-loadout {
    transition: all 0.3s;
    transition-timing-function: var(--ease-out-2);
  }
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
