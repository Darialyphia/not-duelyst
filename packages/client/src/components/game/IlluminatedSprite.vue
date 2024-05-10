<script setup lang="ts">
import { type Texture, type FrameObject, Filter, AnimatedSprite } from 'pixi.js';
import { diffuseGroup, normalGroup } from '@pixi/lights';
import type { AnyObject, Nullable } from '@game/shared';

defineOptions({
  inheritAttrs: false
});

const { diffuseTextures, normalTextures, isFlipped, filters } = defineProps<{
  diffuseTextures: (Texture | FrameObject)[];
  normalTextures: (Texture | FrameObject)[];
  filters?: Filter[];
  isFlipped?: boolean;
}>();

const sprite = defineModel<Nullable<AnimatedSprite>>('sprite', { required: false });

const attrs = useAttrs();
const { isEnabled, diffuseRef, normalRef, normalFilter } =
  useIllumination<AnimatedSprite>(el => {
    sprite.value = el;
  });
const normalFilters = computed(() => {
  if (!isFlipped) return filters;

  return (filters ?? []).concat([normalFilter]);
});
</script>

<template>
  <animated-sprite
    v-bind="attrs"
    :ref="diffuseRef"
    :filters="filters"
    :textures="diffuseTextures"
  />

  <animated-sprite
    v-if="isEnabled"
    v-bind="attrs"
    :ref="normalRef"
    :filters="normalFilters"
    :textures="normalTextures"
  />
</template>
