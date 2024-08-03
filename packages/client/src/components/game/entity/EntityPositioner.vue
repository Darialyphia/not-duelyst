<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { type Point3D } from '@game/shared';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, camera } = useGame();
const entity = useEntity(entityId);

const position = ref(entity.value.position.serialize());
const isMoving = ref(false);

const move = (path: Point3D[]) => {
  isMoving.value = true;
  const timeline = gsap.timeline({
    onComplete() {
      console.log('move complete');
      isMoving.value = false;
    }
  });
  for (const point of path) {
    timeline.to(position.value, {
      ...point,
      duration: 0.5,
      // ease: Power0.easeNone
      ease: Power1.easeOut
    });
  }
  timeline.play();

  return timeline;
};

useSessionEvent('entity:before_move', ([event]) => {
  if (!event.entity.equals(entity.value)) return Promise.resolve();
  return new Promise<void>(resolve => {
    move(event.path).then(() => {
      resolve();
    });
  });
});
useSessionEvent('entity:after_move', () => {
  position.value = entity.value.position.serialize();
});
useSessionEvent('entity:after_teleport', () => {
  position.value = entity.value.position.serialize();
});
</script>

<template>
  <IsoPositioner
    v-if="entity"
    :animated="!isMoving"
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
    <slot />
  </IsoPositioner>
</template>
