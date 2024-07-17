<script setup lang="ts">
import { FACTIONS, type CardBlueprint, type Faction } from '@game/sdk';
import type { Nullable } from '@game/shared';

const factions = Object.values(FACTIONS);

const filter = defineModel<Faction | null | undefined>('filter', { required: true });
const { general } = defineProps<{ general: Nullable<CardBlueprint> }>();
</script>

<template>
  <header class="fancy-surface border-none">
    <BackButton class="flex-self-center" />
    <div class="flex gap-2">
      <Sound
        v-for="faction in factions"
        :key="faction.id"
        sound="button-hover"
        :triggers="['mouseenter']"
      >
        <button
          :class="filter?.equals(faction) && 'active'"
          :disabled="!!general && !general?.faction?.equals(faction)"
          @click="
            () => {
              if (filter?.equals(faction)) {
                filter = undefined;
              } else {
                filter = faction;
              }
            }
          "
        >
          {{ faction.name }}
        </button>
      </Sound>
      <Sound sound="button-hover" :triggers="['mouseenter']">
        <button
          :class="filter === null && 'active'"
          @click="
            () => {
              if (filter === null) {
                filter = undefined;
              } else {
                filter = null;
              }
            }
          "
        >
          Neutral
        </button>
      </Sound>
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

button {
  cursor: pointer;
  user-select: none;

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: var(--size-2);

  font-weight: var(--font-weight-5);
  text-transform: capitalize;

  &:hover:not(:disabled) {
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
  }

  &.active {
    border-bottom: solid var(--border-size-1) var(--primary);
    > img {
      transform: scale(1.25);
      filter: contrast(1.5) brightness(1.3);
    }
  }

  img {
    transition: transform 0.2s;
  }
}
</style>
