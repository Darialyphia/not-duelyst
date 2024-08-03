<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { Container } from 'pixi.js';
import { PTransition } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, fx } = useGame();
const entity = useEntity(entityId);

const shouldFlip = ref(false);
const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  if (shouldFlip.value) value *= -1;
  return value;
});

const areStatsDisplayed = ref(false);
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
      areStatsDisplayed.value = true;
    }
  });
};

const alpha = ref(1);

useSessionEvent('entity:before_deal_damage', ([{ entity: attacker, target }]) => {
  if (!attacker.equals(entity.value)) return;
  if (target.position.x === entity.value.position.x) {
    shouldFlip.value = entity.value.player.isPlayer1;
  } else if (entity.value.player.isPlayer1) {
    shouldFlip.value = target.position.x < entity.value.position.x;
  } else {
    shouldFlip.value = target.position.x > entity.value.position.x;
  }
});
useSessionEvent('entity:after_attack', () => {
  shouldFlip.value = false;
});

useSessionEvent('entity:before_destroy', ([event]) => {
  if (!event.equals(entity.value)) return;
  return new Promise(resolve => {
    gsap.to(alpha, {
      value: 0,
      duration: 1,
      ease: Power1.easeOut,
      onComplete: resolve
    });
  });
});
</script>

<template>
  <EntityPositioner :entity-id="entityId">
    <container
      :ref="
        (container: any) => {
          if (container?.parent) {
            fx.registerEntityRootContainer(entity.id, container.parent);
          }
        }
      "
      :alpha="alpha"
    >
      <container>
        <EntityShadow :entity-id="entityId" :scale-x="scaleX" />

        <PTransition appear @enter="onEnter">
          <container>
            <EntityOrientationIndicator :entity-id="entityId" />
            <EntitySprite :entity-id="entityId" :scale-x="scaleX" />
            <EntitySimulationResult :entity-id="entityId" />
          </container>
        </PTransition>
      </container>

      <EntityVFX :entity-id="entityId" />

      <EntityStats v-if="areStatsDisplayed" :entity-id="entityId" />
    </container>
  </EntityPositioner>
</template>
