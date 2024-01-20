<script setup lang="ts">
import { FACTIONS } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';

const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);

const filter = defineModel<string>('filter', { required: true });
</script>

<template>
  <header class="fancy-surface border-none">
    <BackButton class="flex-self-center" />
    <div class="flex gap-2">
      <UiButton
        v-for="faction in factions"
        :key="faction"
        class="capitalize"
        :class="faction === filter ? 'primary-button' : 'ghost-button'"
        @click="filter = faction"
      >
        {{ faction }}
      </UiButton>
    </div>
  </header>
</template>

<style scoped lanh="postcss">
header {
  display: flex;
  gap: var(--size-8);
  padding: var(--size-3) var(--size-6);
}
</style>
