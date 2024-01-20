<script setup lang="ts">
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import { UNITS } from '@hc/sdk';

const { loadout } = defineProps<{
  loadout: LoadoutDto;
}>();

const getImage = (unitId: string) => {
  const unit = UNITS[unitId];

  return `/assets/units/${unit.spriteId}-icon.png`;
};

const generalImage = computed(() => {
  return getImage(loadout.generalId);
});
</script>

<template>
  <article class="fancy-surface">
    <span>{{ loadout.name }}</span>
    <div>
      <img :src="generalImage" />
      <img v-for="unitId in loadout.unitIds" :key="unitId" :src="getImage(unitId)" />
    </div>
  </article>
</template>

<style scoped lang="postcss">
article {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  justify-content: space-between;

  padding: 0;
  padding: var(--size-1) var(--size-2);

  > div {
    overflow-x: hidden;
    display: flex;
    gap: var(--size-1);
    align-items: center;
  }
}

span {
  display: block;
  flex-grow: 1;
  flex-shrink: 0;
  width: max-content;
}

img {
  overflow: hidden;
  flex-shrink: 0;

  aspect-ratio: 1;
  width: var(--size-7);

  border: var(--fancy-border);
  border-radius: var(--radius-round);
  &:first-of-type {
    width: var(--size-8);
  }
}
</style>
