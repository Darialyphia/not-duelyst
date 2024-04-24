<script setup lang="ts">
import type { Spritesheet } from 'pixi.js';
import IlluminatedSprite from '../IlluminatedSprite.vue';

const { assets } = useGame();
const diffuseTextures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSpritesheet('hovered-cell'))
);

const normalSheet = ref<Spritesheet | null>(null) as Ref<Spritesheet | null>;

onMounted(async () => {
  const diffuseSheet = assets.getSpritesheet('hovered-cell');
  normalSheet.value = await assets.loadNormalSpritesheet('hovered-cell', diffuseSheet);
});
const normalTextures = computed(() => {
  if (!normalSheet.value) return null;
  return createSpritesheetFrameObject('idle', normalSheet.value);
});
</script>

<template>
  <IlluminatedSprite
    v-if="diffuseTextures && normalTextures"
    :x="0"
    :event-mode="'none'"
    :anchor="0.5"
    playing
    :diffuse-textures="diffuseTextures"
    :normal-textures="normalTextures"
  />
</template>
