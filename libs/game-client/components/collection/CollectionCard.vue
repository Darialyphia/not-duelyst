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

const MAX_ANGLE = 15;
const onMousemove = (e: MouseEvent) => {
  if (!rootEl.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = rootEl.value.getBoundingClientRect();
  angle.value = {
    x: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    y: ((clientY - top) / height - 0.5) * MAX_ANGLE
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
      <Transition>
        <Icon
          v-if="isInLoadout && isEditingLoadout"
          name="material-symbols-light:arrow-drop-down-circle-rounded"
          size="2rem"
          class="used-indicator"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@keyframes test {
  from {
    transform: translateX(calc(-1 * var(--size-4)));
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
  position: relative;
  overflow-y: hidden;
  display: grid;
  transition: filter 0.3s;

  > * {
    overflow-y: hidden;
  }

  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }

  &.used {
    outline: solid var(--border-size-2) var(--primary);
  }

  &:not(.disabled):hover {
    /* transform: rotateY(calc(1deg * var(--rotate-y))); */
    transform: rotateY(calc(1deg * var(--rotate-y))) rotateX(calc(1deg * var(--rotate-x)));
  }
}

.used-indicator {
  position: absolute;
  right: 0;
  bottom: 0;

  margin: var(--size-2);

  color: var(--green-5);

  border: solid var(--border-size-2) var(--green-2);
  border-radius: var(--radius-round);

  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }
  &:is(.v-enter-from, .v-leave-to) {
    transform: scale(0);
    opacity: 0;
  }
}
</style>
