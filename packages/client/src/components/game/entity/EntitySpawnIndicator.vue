<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import type { Nullable, Point3D } from '@game/shared';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, session, assets } = useGame();
const entity = useEntity(entityId);

const position = computed(() => {
  return entity.value.card.meta.spawnPosition as Nullable<Point3D>;
});

const frameTag = computed(() => {
  if (!position.value) return;

  const { x: eX, y: eY } = entity.value.position;
  const { x, y } = position.value;

  let base = 0;
  if (eX === x && eY < y) base = 1;
  if (eX > x && eY < y) base = 2;
  if (eX > x && eY === y) base = 3;
  if (eX > x && eY > y) base = 4;
  if (eX === x && eY > y) base = 5;
  if (eX < x && eY > y) base = 6;
  if (eX < x && eY == y) base = 7;
  const offset = camera.angle.value / 45;
  return (base + offset) % 8;
});

const textures = computed(() =>
  createSpritesheetFrameObject(
    `${frameTag.value}`,
    assets.getSpritesheet('spawn-direction')
  )
);
</script>

<template>
  <IsoPositioner
    v-if="position && !entity.isDispelled"
    animated
    v-bind="position"
    :z-index-offset="2.5"
    :angle="camera.angle.value"
    :height="session.boardSystem.height"
    :width="session.boardSystem.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.65
    }"
    event-mode="none"
  >
    <Sprite
      v-if="textures"
      :texture="textures[0].texture"
      :anchor-x="0.5"
      :anchor-y="1"
      :y="CELL_HEIGHT * 1.15"
      event-mode="none"
    />
  </IsoPositioner>
</template>
