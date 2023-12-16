<script setup lang="ts">
import gsap from 'gsap';
import type { Container } from 'pixi.js';

const props = defineProps<{
  x: number;
  y: number;
  z: number;
  debug?: boolean;
  speed?: number;
  zIndex: number;
}>();

// const { isPlaying } = useFXSequencer();
const tweened = ref({ x: props.x, y: props.y });

const { fx } = useGame();
watch(
  () => ({ x: props.x, y: props.y }),
  newPos => {
    gsap.to(tweened.value, {
      duration: fx.isMoving.value ? 0 : props.speed ?? 0.5,
      x: newPos.x,
      ease: fx.isMoving.value ? Power0.easeNone : Power2.easeOut
    });
    gsap.to(tweened.value, {
      duration: fx.isMoving.value ? 0 : props.speed ?? 0.5,
      y: newPos.y,
      ease: fx.isMoving.value ? Power0.easeNone : Power2.easeOut
    });
  }
);

const tileWidth = CELL_SIZE;
const tileHeight = tileWidth / 2;

const containerRef = ref<Container>();
const { autoDestroyRef } = useAutoDestroy();

// ts in unhappy if we type the parameter, because vue expects fucntion refs to take a VNode as argument
// However, in vue3-pixi, the behavior is different
const setContainer = (_container: any) => {
  const container = _container as Container;
  if (!container) return;
  autoDestroyRef(container);
  containerRef.value = container;
};

watchEffect(() => {
  if (containerRef.value) {
    containerRef.value.zOrder = props.zIndex;
  }
});
</script>

<template>
  <container :ref="setContainer" :x="tweened.x" :y="tweened.y" :z-index="props.zIndex">
    <slot />
  </container>
  <text
    v-if="props.debug"
    :ref="el => autoDestroyRef(el)"
    :style="{ fontSize: 20, fill: 'white' }"
    :scale="0.5"
    :z-index="1000"
    :x="tweened.x"
    :anchor="0.5"
    :y="tweened.y + tileHeight * 4"
  >
    {{ props.zIndex }}
  </text>
</template>
