<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Keyword } from '@game/sdk';

const { keyword } = defineProps<{
  keyword: Keyword;
}>();

const textures = useIlluminatedTexture(keyword.spriteId!, 'default');
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 0 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
  >
    <container v-if="textures.diffuse && textures.normal">
      <IlluminatedSprite
        :diffuse-textures="textures.diffuse"
        :normal-textures="textures.normal"
        :anchor-x="0.5"
        :anchor-y="0"
        event-mode="none"
        loop
        playing
        :z-index="1"
        :y="-CELL_HEIGHT * 0.6"
      />
    </container>
  </PTransition>
</template>
