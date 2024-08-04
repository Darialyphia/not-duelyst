<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { AnimatedSprite, type FrameObject } from 'pixi.js';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { assets } = useGame();
const entity = useEntity(entityId);

const pedestalTextures = ref<FrameObject[]>();
watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(entity.value.card.pedestalId);
  pedestalTextures.value = createSpritesheetFrameObject('idle', spritesheet);
});
</script>

<template>
  <animated-sprite
    v-if="pedestalTextures"
    :textures="pedestalTextures"
    :anchor-x="0.5"
    :anchor-y="1"
    :playing="true"
    :y="CELL_HEIGHT * 1.15"
  />
</template>
