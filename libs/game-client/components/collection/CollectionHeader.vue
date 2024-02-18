<script setup lang="ts">
import { FACTIONS, type UnitBlueprint } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';
import type { Nullable } from '@hc/shared';

const { selectedGeneral, sidebarView } = defineProps<{
  sidebarView: 'form' | 'list';
  selectedGeneral: Nullable<UnitBlueprint>;
}>();

const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);
const filter = defineModel<string>('filter', { required: true });

const isDisabled = (faction: FactionId) => {
  if (sidebarView === 'list') return false;
  if (faction === 'neutral') return false;

  if (!selectedGeneral) return false;

  return selectedGeneral.faction.id !== faction;
};
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
        :disabled="isDisabled(faction)"
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
  padding: var(--size-2) var(--size-6);
  box-shadow: none;
}
</style>
