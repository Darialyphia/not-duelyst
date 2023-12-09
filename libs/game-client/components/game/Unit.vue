<script setup lang="ts">
import type { Entity } from '@hc/sdk/src/entity/entity';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { gameSession, assets, state, mapRotation } = useGame();

const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSprite(entity.unitId, 'placeholder'))
);

const onClick = () => {
  console.log(entity);
};

const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return entity.playerId === state.value.players[0].id ? -1 : 1;
  }

  return entity.playerId === state.value.players[0].id ? 1 : -1;
});

const offset = computed(() => ({
  x: 0,
  z: 0,
  y: gameSession.map.getCellAt(entity.position)?.isHalfTile
    ? -CELL_SIZE * 0.75
    : -CELL_SIZE
}));
</script>

<template>
  <IsoPositioner
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z + 0.1"
    :offset="offset"
  >
    <animated-sprite
      :textures="textures"
      :anchor-x="0.5"
      :scale-x="scaleX"
      @pointerup="onClick"
    />
  </IsoPositioner>
</template>
