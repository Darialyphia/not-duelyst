<script setup lang="ts">
import type { Id } from '@hc/api/convex/_generated/dataModel';
import type { UnitBlueprint } from '@hc/sdk';

const { canAddToLoadout, isEditingLoadout, card, isInLoadout } = defineProps<{
  canAddToLoadout: boolean;
  isInLoadout: boolean;
  isEditingLoadout: boolean;
  card: { unit: UnitBlueprint; _id: Id<'collectionItems'>; unitId: string };
}>();

const emit = defineEmits<{ toggle: [] }>();
const rootEl = ref<HTMLElement>();

const angle = ref({
  x: 0,
  y: 0
});

const { left, top, width, height } = useElementBounding(rootEl);
const onMousemove = (e: MouseEvent) => {
  const { clientX, clientY } = e;
  angle.value = {
    x: ((clientX - left.value) / width.value - 0.5) * 15,
    y: ((clientY - top.value) / height.value - 0.5) * 15
  };
};
</script>

<template>
  <div class="perspective-wrapper">
    <div
      ref="rootEl"
      :tabindex="isEditingLoadout && !canAddToLoadout ? -1 : 0"
      class="card"
      :class="{
        used: isEditingLoadout && isInLoadout
      }"
      :style="{
        '--rotate-y': angle.x.toFixed(2),
        '--rotate-x': angle.y.toFixed(2)
      }"
      @mousemove="onMousemove"
      @click="emit('toggle')"
      @keyup.enter="emit('toggle')"
    >
      <UnitBlueprintCard :unit="card.unit" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
@keyframes test {
  from {
    transform: translateX(var(--size-4));
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
.perspective-wrapper {
  transform-style: preserve-3d;
  perspective: 40rem;
  animation: test 0.3s;
  > * {
    height: 100%;
  }
}
.card {
  overflow-y: hidden;
  > * {
    height: 100%;
  }
  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }

  &.used {
    opacity: 0.8;
    filter: contrast(120%);
    outline: solid var(--border-size-2) var(--primary);
  }

  &:not(.disabled):hover {
    /* transform: rotateY(calc(1deg * var(--rotate-y))); */
    transform: rotateY(calc(1deg * var(--rotate-y))) rotateX(calc(1deg * var(--rotate-x)));
  }
}
</style>
