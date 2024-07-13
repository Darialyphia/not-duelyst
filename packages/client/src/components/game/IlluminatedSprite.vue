<script setup lang="ts">
import { type Texture, type FrameObject, Filter, AnimatedSprite } from 'pixi.js';
import { diffuseGroup, normalGroup } from '@pixi/lights';
import type { AnyObject, Nullable } from '@game/shared';

defineOptions({
  inheritAttrs: false
});

const {
  diffuseTextures,
  normalTextures,
  isFlipped,
  filters,
  isAnimated = true
} = defineProps<{
  diffuseTextures: (Texture | FrameObject)[];
  normalTextures: (Texture | FrameObject)[];
  filters?: Filter[];
  isFlipped?: boolean;
  isAnimated?: boolean;
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
    v-if="isAnimated"
    v-bind="attrs"
    :ref="diffuseRef"
    :filters="filters"
    :textures="diffuseTextures"
  />
  <sprite
    v-else
    v-bind="attrs"
    :ref="diffuseRef"
    :filters="filters"
    :texture="diffuseTextures[0]"
  />

  <template v-if="isEnabled">
    <!-- <animated-sprite
      v-if="isAnimated"
      v-bind="attrs"
      :ref="normalRef"
      :filters="normalFilters"
      :textures="normalTextures"
    />
    <sprite
      v-else
      v-bind="attrs"
      :ref="normalRef"
      :filters="normalFilters"
      :textures="normalTextures"
    /> -->
  </template>
</template>
