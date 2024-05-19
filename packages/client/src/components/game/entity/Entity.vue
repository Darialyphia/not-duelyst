<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { Container } from 'pixi.js';
import { PTransition } from 'vue3-pixi';
const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, camera, fx } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const settings = useUserSettings();

const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isEnterAnimationDone = ref(false);
const onEnter = (container: Container) => {
  container.y = -40;
  container.alpha = 0;

  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    onStart() {
      container.alpha = 1;
    },
    onComplete() {
      isEnterAnimationDone.value = true;
    }
  });
};
const onShadowEnter = (container: Container) => {
  container.scale.set(0);
  container.pivot.set(container.width / 2, container.height / 2);
  gsap.to(container.scale, {
    x: 1,
    y: 1,
    duration: 1,
    ease: Bounce.easeOut
  });
};

const keywordsWithSprite = computed(() =>
  entity.value.keywords.filter(keyword => {
    if (!keyword.spriteId) return false;
    if (keyword.stacks === 0) return false;
    return true;
  })
);

onMounted(() => {
  session.fxSystem.playSfxOnEntity(entity.value.id, {
    resourceName: 'fx_smoke2',
    animationName: 'smokeground',
    offset: { x: 0, y: 20 },
    delay: 200
  });
});
</script>

<template>
  <IsoPositioner
    v-if="entity && fx.entityPositionsMap.value.get(entityId)"
    :animated="!fx.isPlaying.value"
    v-bind="fx.entityPositionsMap.value.get(entityId)!"
    :z-index-offset="5"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.7
    }"
    event-mode="none"
  >
    <container
      :ref="
        (container: any) => {
          if (container?.parent) {
            fx.registerEntityRootContainer(entity.id, container.parent);
          }
        }
      "
    >
      <container :scale-x="scaleX">
        <PTransition v-if="settings.fx.shadows" appear @enter="onShadowEnter">
          <container>
            <EntityShadow :entity-id="entityId" />
          </container>
        </PTransition>

        <PTransition appear @enter="onEnter">
          <container>
            <EntitySprite :entity-id="entityId" />
          </container>
        </PTransition>
      </container>

      <EntityKeyword
        v-for="keyword in keywordsWithSprite"
        :key="keyword.id"
        :keyword="keyword"
      />

      <EntityStats v-if="isEnterAnimationDone" :entity-id="entityId" />
    </container>
  </IsoPositioner>
</template>
