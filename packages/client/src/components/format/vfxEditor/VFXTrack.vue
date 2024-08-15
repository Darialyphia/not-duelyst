<script setup lang="ts">
import {
  AddLightVFXNode,
  BloomEntityVFXNode,
  BloomVFXNode,
  PlaySfxOnEntityVFXNode,
  PlaySfxVFXNode,
  ShakeEntityVFXNode,
  ShakeVFXNode,
  ShockwaveEntityVFXNode,
  ShockwaveVFXNode,
  TintEntityVFXNode,
  TintVFXNode,
  WaitVFXNode
} from '#components';
import type { VFXSequenceTrack, VFXStep } from '@game/sdk/src/card/card-effect';
import { type Nullable, isDefined } from '@game/shared';

const track = defineModel<VFXSequenceTrack>({ required: true });

const stepsDict: Record<
  VFXStep['type'],
  { label: string; color: string; component: Component }
> = {
  addLightOnEntity: {
    label: 'Add light on a unit',
    color: 'var(--red-10)',
    component: AddLightVFXNode
  },
  bloomEntity: {
    label: 'Add bloom on a unit',
    color: 'var(--orange-10)',
    component: BloomEntityVFXNode
  },
  bloomScreen: {
    label: 'Add bloom on the screen',
    color: 'var(--yellow-10)',
    component: BloomVFXNode
  },
  playSfxOnEntity: {
    label: 'Add sprite on unit',
    color: 'var(--green-10)',
    component: PlaySfxOnEntityVFXNode
  },
  playSfxOnScreenCenter: {
    label: 'Add sprite on screen',
    color: 'var(--teal-10)',
    component: PlaySfxVFXNode
  },
  shakeEntity: {
    label: 'Shake a unit',
    color: 'var(--cyan-10)',
    component: ShakeEntityVFXNode
  },
  shakeScreen: {
    label: 'Shake screen',
    color: 'var(--blue-10)',
    component: ShakeVFXNode
  },
  shockwaveOnEntity: {
    label: 'Play shockwave on a unit',
    color: 'var(--indigo-10)',
    component: ShockwaveEntityVFXNode
  },
  shockwaveOnScreenCenter: {
    label: 'Play shockwave on screen',
    color: 'var(--violet-10)',
    component: ShockwaveVFXNode
  },
  tintEntity: {
    label: 'Tint a unit',
    color: 'var(--purple-10)',
    component: TintEntityVFXNode
  },
  tintScreen: { label: 'Tint screen', color: 'var(--pink-9)', component: TintVFXNode },
  wait: { label: 'Wait', color: 'var(--gray-8)', component: WaitVFXNode }
};

const MAX_DURATION = 10_000;
const MIN_STEP_DURATION = 200;

const trackDuration = computed(() =>
  track.value.steps.reduce((total, step) => total + step.params.duration, 0)
);

const trackElement = ref<HTMLElement>();
const trackRect = useElementBounding(trackElement);

const isResizing = ref(false);
const startResize = (index: number, e: MouseEvent) => {
  isResizing.value = true;
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
    isResizing.value = false;
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

const isAddStepModalOpened = ref(false);

const selectedStepIndex = ref<Nullable<number>>(null);
const selectedStep = computed(() =>
  isDefined(selectedStepIndex.value) ? track.value.steps[selectedStepIndex.value] : null
);
const isSettingsDrawerOpened = computed({
  get() {
    return isDefined(selectedStepIndex.value);
  },
  set() {
    selectedStepIndex.value = null;
  }
});
</script>

<template>
  <div class="flex gap-2 flex-1 items-center">
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
          '--bg': stepsDict[step.type].color,
          '--width-percent': (step.params.duration * 100) / MAX_DURATION
        }"
        :draggable="!isResizing"
        @dragstart="onDragStart(index)"
        @drop.prevent="onDrop(index)"
        @dragover.prevent="dragHoveredIndex = index"
        @dragenter="dragHoveredIndex = index"
        @dragleave="dragHoveredIndex = null"
        @dragend="dragHoveredIndex = null"
        @dblclick="selectedStepIndex = index"
      >
        {{ stepsDict[step.type].label }}

        <UiIconButton
          name="material-symbols:delete-outline"
          class="error-button mt-2"
          :style="{ '--ui-icon-button-size': 'var(--font-size-1)' }"
          @click="track.steps.splice(index, 1)"
        />
        <div
          v-if="!['playSfcOnEntity', 'playSfxOnScreenCenter'].includes(step.type)"
          class="resize-handle"
          @mousedown="startResize(index, $event)"
        />
      </div>
    </div>
    <UiIconButton
      name="material-symbols:add"
      class="primary-button"
      @click="isAddStepModalOpened = true"
    />

    <UiModal v-model:is-opened="isAddStepModalOpened" title="Add Step to track">
      <ul class="steps-list">
        <li v-for="(step, key) in stepsDict" :key="key">
          <button
            class="aspect-square"
            :style="{
              '--bg': step.color
            }"
            @click="
              () => {
                track.steps.push({
                  type: key,
                  params: { duration: 500 } as any
                });
                isAddStepModalOpened = false;
                selectedStepIndex = track.steps.length - 1;
              }
            "
          >
            {{ step.label }}
          </button>
        </li>
      </ul>
    </UiModal>

    <UiDrawer v-model:is-opened="isSettingsDrawerOpened" direction="right">
      <component
        :is="stepsDict[selectedStep.type].component"
        v-if="isDefined(selectedStep)"
        v-model="selectedStep"
      />
    </UiDrawer>
  </div>
</template>

<style scoped lang="postcss">
.track {
  display: flex;
  flex-grow: 1;

  height: var(--size-10);

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

  text-overflow: ellipsis;
  white-space: nowrap;

  background-color: var(--bg);
  border: solid var(--border-size-1) var(--border);
  &:not(:hover) > button {
    display: none;
  }
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

.steps-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-3);

  button {
    width: 100%;
    height: 100%;
    background-color: var(--bg);
    &:hover {
      filter: brightness(120%);
    }
  }
}
</style>
