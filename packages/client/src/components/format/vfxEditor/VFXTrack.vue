<script setup lang="ts">
import type { VFXSequenceTrack, VFXStep } from '@game/sdk/src/card/card-effect';
import type { Nullable } from '@game/shared';

const track = defineModel<VFXSequenceTrack>({ required: true });

const stepColors: Record<VFXStep['type'], string> = {
  addLightOnEntity: 'var(--red-10)',
  bloomEntity: 'var(--orange-10)',
  bloomScreen: 'var(--yellow-10)',
  playSfxOnEntity: 'var(--green-10)',
  playSfxOnScreenCenter: 'var(--teal-10)',
  shakeEntity: 'var(--cyan-10)',
  shakeScreen: 'var(--blue-10)',
  shockwaveOnEntity: 'var(--indigo-10)',
  shockwaveOnScreenCenter: 'var(--violet-10)',
  tintEntity: 'var(--purple-10)',
  tintScreen: 'var(--pink-9)',
  wait: 'var(--gray-8)'
};

const MAX_DURATION = 10_000;
const MIN_STEP_DURATION = 200;

const trackDuration = computed(() =>
  track.value.steps.reduce((total, step) => total + step.params.duration, 0)
);

const trackElement = ref<HTMLElement>();
const trackRect = useElementBounding(trackElement);

const startResize = (index: number, e: MouseEvent) => {
  const el = (e.target as HTMLElement).parentElement!;
  const rect = el.getBoundingClientRect();

  const onMousemove = (e: MouseEvent) => {
    const newWidth = e.clientX - rect.left;
    const newDuration = Math.round(
      Math.max(MIN_STEP_DURATION, (newWidth * MAX_DURATION) / trackRect.width.value)
    );
    const total = track.value.steps.reduce(
      (total, step, i) => total + (i === index ? newDuration : step.params.duration),
      0
    );

    if (total > MAX_DURATION) return;
    track.value.steps[index].params.duration = newDuration;
  };

  const onMouseleave = () => {
    window.removeEventListener('mousemove', onMousemove);
    window.removeEventListener('mouseup', onMouseleave);
  };
  window.addEventListener('mousemove', onMousemove);
  window.addEventListener('mouseup', onMouseleave);
};

const draggedStepIndex = ref<Nullable<number>>(null);
const dragHoveredIndex = ref<Nullable<number>>(null);
const onDrop = (newIndex: number) => {
  if (!draggedStepIndex.value) return;
  if (draggedStepIndex.value === newIndex) return;
  const [step] = track.value.steps.splice(draggedStepIndex.value, 1);
  track.value.steps.splice(newIndex, 0, step);
  draggedStepIndex.value = null;
  dragHoveredIndex.value = null;
};
const onDragStart = (index: number) => {
  draggedStepIndex.value = index;
};
</script>

<template>
  <div
    ref="trackElement"
    class="track"
    :class="{
      invalid: trackDuration > MAX_DURATION
    }"
  >
    <div
      v-for="(step, index) in track.steps"
      :key="index"
      class="step"
      :class="{ 'dragged-over': dragHoveredIndex === index }"
      :style="{
        '--bg': stepColors[step.type],
        '--width-percent': (step.params.duration * 100) / MAX_DURATION
      }"
      draggable="true"
      @dragstart="onDragStart(index)"
      @drop.prevent="onDrop(index)"
      @dragover.prevent="dragHoveredIndex = index"
      @dragenter="dragHoveredIndex = index"
      @dragleave="dragHoveredIndex = null"
    >
      {{ step.type }}

      <div
        class="resize-handle"
        @click.stop
        @mousedown.stop="startResize(index, $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.track {
  display: flex;
  flex-grow: 1;

  height: var(--size-8);

  background-color: var(--surface-2);
  border: solid var(--border-size-1) var(--border-dimmed);
  &.invalid {
    border-color: var(--red-7);
  }
}

.step {
  user-select: none;

  position: relative;

  overflow: hidden;
  flex-basis: calc(1% * var(--width-percent));
  flex-shrink: 0;

  padding: var(--size-2) var(--size-1);

  background-color: var(--bg);
  border: solid var(--border-size-1) var(--border);

  &.dragged-over {
    opacity: 0.5;
    filter: brightness(120%);
  }
}

.resize-handle {
  cursor: ew-resize;

  position: absolute;
  top: 0;
  right: 0;

  width: var(--size-2);
  height: 100%;

  background-color: inherit;
  border-right: solid var(--border-size-2) var(--border);
  border-left: solid var(--border-size-2) var(--border);
}
</style>
