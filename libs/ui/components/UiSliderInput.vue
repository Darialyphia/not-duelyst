<script setup lang="ts">
const vmodel = defineModel<number[]>({ required: true });
const { label } = defineProps<{
  label: string;
}>();
</script>

<template>
  <SliderRoot v-model="vmodel" class="slider-root" :max="100" :step="1">
    <SliderTrack class="slider-track">
      <SliderRange class="slider-range" />
    </SliderTrack>
    <SliderThumb class="slider-thumb" :aria-label="label" />
  </SliderRoot>
</template>

<style lang="postcss">
.slider-root {
  touch-action: none;
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  height: var(--size-4);
}

.slider-track {
  position: relative;

  flex-grow: 1;

  height: 3px;

  background-color: hsl(var(--color-primary-hsl) / 0.2);
  border-radius: var(--radius-pill);
}

.slider-range {
  position: absolute;
  height: 100%;
  background-color: hsl(var(--color-primary-hsl) / 0.5);
  border-radius: var(--radius-pill);
}

.slider-thumb {
  display: block;

  aspect-ratio: 1;
  width: var(--size-4);

  background-color: var(--primary);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);

  &:hover {
    background-color: var(--primary-hover);
  }

  &:focus {
    box-shadow: var(--shadow-3);
  }
}
</style>
