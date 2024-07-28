<script setup lang="ts">
import { isDefined, type Nullable } from '@game/shared';
import { PTransition } from 'vue3-pixi';
import type { Spritesheet } from 'pixi.js';

const { bitmask, sheet, isEnabled } = defineProps<{
  bitmask: Nullable<number>;
  sheet: Spritesheet;
  isEnabled: boolean;
}>();

const texture = computed(() => {
  if (!isDefined(bitmask)) return;

  return getTextureIndexFromBitMask(bitmask, sheet);
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 0.8 }"
    :leave="{ alpha: 0 }"
  >
    <sprite
      v-if="texture && isEnabled"
      :texture="texture"
      :anchor="0.5"
      event-mode="none"
    />
  </PTransition>
</template>
