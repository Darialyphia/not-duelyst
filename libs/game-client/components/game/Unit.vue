<script setup lang="ts">
import type { Entity } from '@hc/sdk/src/entity/entity';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { assets, state } = useGame();

const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSprite(entity.unitId, 'placeholder'))
);

const isFlipped = computed(() => entity.playerId === state.value.players[1].id);

const onClick = () => {
  console.log(entity);
};
</script>

<template>
  <IsoPositioner
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z + 0.1"
  >
    <animated-sprite
      :textures="textures"
      :anchor-x="0.5"
      :y="-CELL_SIZE / 2"
      :scale-x="isFlipped ? 1 : -1"
      @pointerup="onClick"
    />
  </IsoPositioner>
</template>
