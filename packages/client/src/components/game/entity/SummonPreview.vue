<script setup lang="ts">
import { AnimatedSprite } from 'pixi.js';
import { match } from 'ts-pattern';

const { camera, assets, ui } = useGame();

const textures = computed(() => {
  const id = ui.selectedCard.value?.blueprint.spriteId;
  if (!id) return null;
  const sheet = assets.getSpritesheet(id);

  return createSpritesheetFrameObject('breathing', sheet);
});

const scaleX = computed(() => {
  let value = ui.selectedCard.value!.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isDisplayed = computed(() => {
  if (!textures) return false;

  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.NONE, TARGETING_MODES.BASIC, TARGETING_MODES.SKILL, () => false)
    .with(TARGETING_MODES.SUMMON, () => {
      if (!ui.hoveredCell.value || !ui.selectedCard.value) {
        return false;
      }
      return ui.selectedCard.value.canPlayAt(ui.hoveredCell.value.position);
    })
    .with(TARGETING_MODES.FOLLOWUP, () => {
      return !!ui.selectedCard.value;
    })
    .exhaustive();
});

const position = computed(() => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.NONE, TARGETING_MODES.BASIC, TARGETING_MODES.SKILL, () => null)
    .with(TARGETING_MODES.SUMMON, () => ui.hoveredCell.value!.position)
    .with(TARGETING_MODES.FOLLOWUP, () => ui.summonTarget.value)
    .exhaustive();
});
</script>

<template>
  <IsoPositioner
    v-if="isDisplayed && position"
    :animated="false"
    v-bind="position"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.7
    }"
    event-mode="none"
  >
    <animated-sprite
      :alpha="0.5"
      :textures="textures"
      :scale-x="scaleX"
      :playing="true"
      :anchor-x="0.5"
      :anchor-y="0"
      :y="-CELL_HEIGHT * 0.6"
    />
  </IsoPositioner>
</template>
