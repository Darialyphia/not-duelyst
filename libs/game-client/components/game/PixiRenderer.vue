<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import type { Container } from 'pixi.js';

const { state, gameSession, mapRotation, ui, sendInput, fx, isActivePlayer } = useGame();
const { ui: uiLayer, gameObjects: gameObjectsLayer } = ui.layers;
const app = useApplication();

const screenViewport = shallowRef<Viewport>();

onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.code === 'Space') {
      const center = toIso({ x: 0, y: 0, z: 0 }, mapRotation.value, {
        width: 0,
        height: 0
      });
      screenViewport.value?.moveCenter({ x: center.isoX, y: center.isoY });
    }
    if (e.code === 'KeyQ')
      mapRotation.value = ((mapRotation.value + 360 - 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'KeyE')
      mapRotation.value = ((mapRotation.value + 360 + 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'Tab') {
      if (ui.isMenuOpened.value) return;
      e.preventDefault();
      const selectedEntity = ui.selectedEntity.value;
      const activePlayer = state.value.activePlayer;

      if (!selectedEntity) {
        ui.selectedEntity.value = activePlayer.general;
      } else {
        const player = selectedEntity.player;
        const entities = player.entities;
        const index = entities.findIndex(e => e.equals(selectedEntity));
        if (index === entities.length - 1) {
          ui.selectedEntity.value = player.opponent.general;
        } else {
          ui.selectedEntity.value = entities[index + 1];
        }
      }

      const spriteRef = fx.spriteMap.get(selectedEntity!.id);
      if (!spriteRef) return;
      const sprite = toValue(spriteRef);
      if (!sprite) return;

      fx.viewport?.moveCenter(sprite.position);
    }
    if (!toValue(isActivePlayer)) return;

    if (e.code === 'KeyT') sendInput('end-turn');

    if (
      ui.selectedEntity.value &&
      ui.selectedEntity.value?.playerId !== state.value.activePlayer.id
    ) {
      return;
    }

    const actionCodes = [
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'Digit5',
      'Digit6',
      'Digit7',
      'Digit8',
      'Digit9'
    ];
    actionCodes.forEach((code, index) => {
      if (e.code !== code) return;

      if (e.shiftKey) {
        const player = gameSession.playerManager.getActivePlayer();

        const unit = player.summonableUnits[index];
        if (!unit) return;
        ui.selectedSummon.value = unit.unit;
      } else if (ui.selectedEntity.value) {
        const skill = ui.selectedEntity.value.skills[index];
        if (e.code === code) {
          ui.selectedSkill.value = skill;
        }
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

const worldContainer = ref<Container>();

watchEffect(() => {
  if (!screenViewport.value) return;
  screenViewport.value.pause = ui.targetMode.value === 'move';
});

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso({ x: 0, y: 0, z: 0 }, mapRotation.value, {
      width: 0,
      height: 0
    });

    fx.viewport = screenViewport.value;
    screenViewport.value
      ?.drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      // .mouseEdges({
      //   distance: 10,
      //   speed: 18,
      //   allowButtons: true
      // })
      .clamp({
        top: -screenViewport.value.worldWidth,
        bottom: screenViewport.value.worldWidth,
        left: -screenViewport.value.worldWidth * 1.75,
        right: screenViewport.value.worldWidth * 1.75
      })
      .clampZoom({ minScale: 1, maxScale: 4 })
      .zoomPercent(1, false)
      .moveCenter(center.isoX, center.isoY);
  });

watchEffect(() => {
  if (gameObjectsLayer.value) {
    gameObjectsLayer.value.group.enableSort = true;
    gameObjectsLayer.value.sortableChildren = true;
  }
});
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="app.view.width"
    :world-height="app.view.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <container ref="worldContainer">
      <Layer ref="gameObjectsLayer">
        <MapCell v-for="cell in state.map.cells" :key="cell.id" :cell="cell" />

        <Unit v-for="entity in state.entities" :key="entity.id" :entity="entity" />
      </Layer>

      <Layer ref="uiLayer" />
    </container>
  </viewport>
</template>
