<script setup lang="ts">
import { ColorPickerCanvas, useColorPicker } from '@wattanx/vue-color-picker';

const color = defineModel<string>({ required: true });

const { onMoveHue, onMoveSaturation, selfColor, saturationPosition, huePosition } =
  useColorPicker({
    initialColor: color.value,
    width: 150,
    height: 150
  });

watchEffect(() => {
  color.value = selfColor.value.hex;
});
</script>
<template>
  <div class="color-picker">
    <div class="flex flex-col">
      <ColorPickerCanvas
        class="color-picker-saturation"
        :style="{ backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)` }"
        @change-position="onMoveSaturation"
      >
        <div
          class="color-picker-saturation_cursor"
          :style="{
            backgroundColor: selfColor.hex,
            left: `${saturationPosition.x}px`,
            top: `${saturationPosition.y}px`
          }"
        />
      </ColorPickerCanvas>
      <ColorPickerCanvas class="color-picker-hue" @change-position="onMoveHue">
        <div
          class="color-picker-hue_cursor"
          :style="{
            backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
            left: `${huePosition.x}px`
          }"
        ></div>
      </ColorPickerCanvas>
    </div>

    <div class="preview" :style="{ backgroundColor: selfColor.hex }"></div>
  </div>
</template>

<style scoped>
.color-picker {
  width: 150px;
}

.color-picker-saturation {
  user-select: none;

  position: relative;

  aspect-ratio: 1;
  width: 100%;
  margin-top: var(--size-3);

  background-image: linear-gradient(transparent, black),
    linear-gradient(to right, white, transparent);
}
.color-picker-saturation_cursor {
  position: absolute;
  transform: translate(-10px, -10px);

  box-sizing: border-box;
  width: 20px;
  height: 20px;

  border: var(--border-size-2) solid #ffffff;
  border-radius: 50%;
  box-shadow: var(--shadow-3);
}

.color-picker-hue {
  user-select: none;

  position: relative;

  width: 100%;
  height: var(--size-2);
  margin-top: var(--size-3);

  background-image: linear-gradient(
    to right,
    rgb(255, 0, 0),
    rgb(255, 255, 0),
    rgb(0, 255, 0),
    rgb(0, 255, 255),
    rgb(0, 0, 255),
    rgb(255, 0, 255),
    rgb(255, 0, 0)
  );
  border-radius: var(--radius-3);
}

.color-picker-hue_cursor {
  position: absolute;
  transform: translate(-10px, -4px);

  box-sizing: border-box;
  aspect-ratio: 1;
  width: var(--size-4);

  border: solid var(--border-size-2) var(--border);
  border-radius: var(--radius-round);
  box-shadow: var(--shadow-1);
}

.preview {
  height: var(--size-5);
  margin-block: var(--size-3);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>
