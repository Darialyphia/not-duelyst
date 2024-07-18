<script setup lang="ts">
import { FACTIONS, type CardBlueprint, type Faction } from '@game/sdk';
import type { Nullable } from '@game/shared';
import type { CostFilter } from '~/composables/useCollection';

const factions = Object.values(FACTIONS);

const filter = defineModel<Faction | null | undefined>('filter', { required: true });
const search = defineModel<Nullable<string>>('search', { required: true });
const cost = defineModel<Nullable<CostFilter>>('cost', { required: true });

const { general } = defineProps<{ general: Nullable<CardBlueprint> }>();
</script>

<template>
  <header class="fancy-surface border-none">
    <BackButton class="flex-self-center" />
    <div class="flex flex-1 gap-1">
      <Sound
        v-for="faction in factions"
        :key="faction.id"
        sound="button-hover"
        :triggers="['mouseenter']"
      >
        <button
          class="faction"
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
          class="faction"
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
      <div class="divider" />
      <button
        v-for="i in 9"
        :key="i"
        class="cost"
        :class="cost === i - 1 && 'active'"
        @click="
          () => {
            if (cost === i - 1) {
              cost = null;
            } else {
              cost = (i - 1) as CostFilter;
            }
          }
        "
      >
        {{ i === 9 ? '8+' : i - 1 }}
      </button>
      <div class="divider" />
      <UiTextInput
        id="collection-search"
        v-model="search"
        class="search"
        placeholder="Search by name, keyword..."
        left-icon="material-symbols:search"
      />
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

.faction {
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

.cost {
  cursor: pointer;
  user-select: none;

  display: block;
  display: grid;
  place-items: center;

  aspect-ratio: 1;
  width: 40px;
  height: 40px;
  margin-inline: var(--size-1);

  color: black;

  background-image: url('/assets/ui/card-cost.png');
  background-size: cover;
  filter: grayscale(35%);

  transition: filter 0.3s;

  &.active {
    filter: drop-shadow(2px 2px 0 var(--cyan-5)) drop-shadow(-2px -2px 0 var(--orange-5));
  }
}

.divider {
  display: block;

  width: 1px;
  height: 100%;
  margin-inline: var(--size-4);

  background-color: var(--border);
}

.search {
  flex-grow: 1;
  padding-left: var(--size-2);
  border-radius: var(--radius-pill);
}
</style>
