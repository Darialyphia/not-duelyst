<script setup lang="ts">
import { KEYWORDS, type EntityId } from '@game/sdk';
import { dist, type Point3D } from '@game/shared';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, camera } = useGame();
const entity = useEntity(entityId);
const { settings } = useUserSettings();

const position = ref(entity.value.position.serialize());
const isMoving = ref(false);

const move = (path: Point3D[]) => {
  isMoving.value = true;
  const timeline = gsap.timeline({
    onComplete() {
      isMoving.value = false;
    }
  });
  const hasFlying = entity.value.hasKeyword(KEYWORDS.FLYING);
  if (hasFlying) {
    const end = path.at(-1)!;
    timeline.to(position.value, {
      ...end,
      duration: dist(entity.value.position, end) * 0.3,
      ease: Power0.easeNone
    });
  } else {
    for (const point of path) {
      timeline.to(position.value, {
        ...point,
        duration: settings.value.a11y.reducedMotions ? 0 : 0.5,
        ease: Power1.easeOut
      });
    }
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
useSessionEvent('entity:after_move', ([event]) => {
  if (!event.entity.equals(entity.value)) return Promise.resolve();

  position.value = entity.value.position.serialize();
});
useSessionEvent('entity:after_teleport', ([event]) => {
  if (!event.entity.equals(entity.value)) return Promise.resolve();

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
