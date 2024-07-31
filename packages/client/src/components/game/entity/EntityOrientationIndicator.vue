<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { PTransition } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, assets, ui } = useGame();
const entity = useEntity(entityId);

const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));
const orientationFrameTag = computed(() => {
  const isP1 = entity.value.player.isPlayer1;

  const base = camera.angle.value / 90;

  return isP1 ? base : (base + 2) % 4;
});
const orientationTextures = computed(() =>
  createSpritesheetFrameObject(
    `${orientationFrameTag.value}`,
    assets.getSpritesheet('orientation')
  )
);
</script>

<template>
  <PTransition
    :duration="{ enter: 200, leave: 200 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <Sprite
      v-if="orientationTextures && isHovered"
      :texture="orientationTextures[0].texture"
      :anchor-x="0.5"
      :anchor-y="1"
      :y="CELL_HEIGHT * 1.25"
      event-mode="none"
    />
  </PTransition>
</template>
