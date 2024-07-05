<script setup lang="ts">
import { FACTIONS, type Faction } from '@game/sdk';

const factions = Object.values(FACTIONS);

const filter = defineModel<Faction | null>('filter', { required: true });
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
          @click="
            () => {
              if (filter?.equals(faction)) {
                filter = null;
              } else {
                filter = faction;
              }
            }
          "
        >
          {{ faction.name }}
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
  &:hover {
    color: var(--primary);
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
