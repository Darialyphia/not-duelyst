<script setup lang="ts">
import { isDefined, type Nullable } from '@game/shared';
import { PTransition } from 'vue3-pixi';
import type { Spritesheet } from 'pixi.js';

const { bitmask, sheet, isEnabled } = defineProps<{
  bitmask: Nullable<number>;
  sheet: Spritesheet;
  isEnabled: boolean;
}>();

const { assets } = useGame();

const texture = computed(() => {
  if (!isDefined(bitmask)) return;

  return getTextureIndexFromBitMask(bitmask, sheet);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 0.8 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="texture && isEnabled"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <IlluminatedSprite
        :diffuse-textures="[texture]"
        :normal-textures="[texture]"
        :anchor="0.5"
      />
    </container>
  </PTransition>
</template>
