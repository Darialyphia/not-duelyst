<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import type { Viewport } from 'pixi-viewport';

const { state, mapRotation, ui, sendInput } = useGame();
const app = useApplication();

const screenViewport = shallowRef<Viewport>();

onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'KeyQ')
      mapRotation.value = ((mapRotation.value + 360 - 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'KeyE')
      mapRotation.value = ((mapRotation.value + 360 + 90) % 360) as 0 | 90 | 180 | 270;
    if (e.code === 'KeyA') ui.targetMode.value = 'move';
    if (e.code === 'KeyT') sendInput('end-turn');
    const skillCodes = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
    skillCodes.forEach((code, index) => {
      const skill = state.value.activeEntity.skills[index];
      if (!skill) return;
      if (e.code === code) {
        ui.selectedSkill.value = skill;
      }
    });
  });

  window.addEventListener('resize', () => {
    const center = toIso({ x: 0, y: 0, z: 0 }, mapRotation.value, {
      width: 0,
      height: 0
    });

    screenViewport.value?.moveCenter(center.isoX, center.isoY);
  });
});

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso({ x: 0, y: 0, z: 0 }, mapRotation.value, {
      width: 0,
      height: 0
    });
    screenViewport.value
      ?.drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      .clampZoom({ minScale: 1, maxScale: 4 })
      .zoomPercent(1, false)
      .moveCenter(center.isoX, center.isoY);
  });
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="state.map.width * CELL_SIZE"
    :world-height="state.map.height * CELL_SIZE"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
  >
    <container :sortable-children="true">
      <MapCell v-for="cell in state.map.cells" :key="cell.id" :cell="cell" />

      <Unit v-for="entity in state.entities" :key="entity.id" :entity="entity" />
    </container>
  </viewport>
</template>
