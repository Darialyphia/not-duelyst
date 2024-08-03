<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { AnimatedSprite, BlurFilter } from 'pixi.js';
import { dist, mapRange } from '@game/shared';
import { PTransition, useScreen } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { camera, ui, fx } = useGame();
const { settings } = useUserSettings();
const entity = useEntity(entityId);
const sprite = ref<AnimatedSprite>();
const textures = useEntityTexture(entityId, sprite);

const screen = useScreen();

// const scaleY = ref(-0.5);
// watchEffect(() => {
//   const root = fx.getEntityRoot(entityId);
//   const dist = root
//     ? ui.mousePosition.value.y - root.position.y
//     : ui.mousePosition.value.y;
//   const val = mapRange(
//     dist,
//     [-screen.value.height / 2, screen.value.height / 2],
//     [-0.5, 0.5]
//   );
//   scaleY.value = clamp(val * 5, -0.5, 0.5);
// });

// const getSkewX = () => {
//   let coef = entity.value.player.isPlayer1 ? 1 : -1;
//   if (camera.angle.value === 90 || camera.angle.value === 180) {
//     coef *= -1;
//   }

//   if (scaleY.value < 0) coef *= -1;

//   const root = fx.getEntityRoot(entityId);

//   const dist = root ? ui.mousePosition.value.x - root.position.x : null;

//   return (
//     coef *
//     mapRange(
//       dist ?? ui.mousePosition.value.x,
//       [-camera.offset.value.x, screen.value.height - camera.offset.value.x],
//       [-1, 1]
//     )
//   );
// };

// const skewX = ref(getSkewX());
// watchEffect(() => {
//   // skewX.value = getSkewX();
// });

// const distanceFromMouse = computed(() => {
//   const root = fx.getEntityRoot(entityId);
//   return dist(root ? root.position : { x: 0, y: 0 }, ui.mousePosition.value);
// });

// const ALPHA_DISSIPATION_FACTOR = 2;
// const MAX_ALPHA = 0.8;
// const MIN_ALPHA_DISSIPATION = 0.2;
// const MAX_ALPHA_DISSIPATION = 0.5;
// const MIN_BLUR = 1;
// const MAX_BLUR = 6;

// const alpha = computed(
//   () =>
//     MAX_ALPHA -
//     mapRange(
//       distanceFromMouse.value,
//       [0, Math.hypot(screen.value.height, screen.value.width)],
//       [MIN_ALPHA_DISSIPATION, MAX_ALPHA_DISSIPATION]
//     ) *
//       ALPHA_DISSIPATION_FACTOR
// );

// const blur = computed(() =>
//   mapRange(
//     distanceFromMouse.value,
//     [0, Math.hypot(screen.value.height, screen.value.width)],
//     [MIN_BLUR, MAX_BLUR]
//   )
// );

// const alphaFilter = new AlphaFilter(0.5);
const blurFilter = new BlurFilter(2);
const filters = [blurFilter];
// watchEffect(() => {
// alphaFilter.alpha = alpha.value;
// blurFilter.blur = blur.value;
// });

const isFlipped = computed(() => {
  let value = entity.value.player.isPlayer1 ? false : true;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value = !value;
  }

  return value;
});

const onShadowEnter = (container: AnimatedSprite) => {
  container.scale.set(0);
  container.pivot.set(container.width / 2, container.height / 2);
  gsap.to(container.scale, {
    x: 1,
    y: 1,
    duration: 1,
    ease: Bounce.easeOut
  });
};
</script>

<template>
  <PTransition v-if="settings.fx.shadows" appear @enter="onShadowEnter">
    <container>
      <animated-sprite
        v-if="textures"
        ref="sprite"
        :z-index="1"
        :alpha="0.5"
        :textures="textures"
        :filters="filters"
        :scale-y="-0.5"
        :skew-x="isFlipped ? 0.8 : -0.8"
        :x="0"
        :y="CELL_HEIGHT * 0.5"
        :anchor="{ x: 0.5, y: 1 }"
        :pivot-y="20"
        loop
        event-mode="none"
        playing
        :tint="0"
      />
    </container>
  </PTransition>
</template>
