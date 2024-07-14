<script setup lang="ts">
import { CARD_KINDS } from '@game/sdk';
import type { Nullable } from '@game/shared';
import { TextStyle, type FrameObject } from 'pixi.js';
import { match } from 'ts-pattern';

const { camera, ui } = useGame();

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
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.CARD_CHOICE,
      () => false
    )
    .with(TARGETING_MODES.SUMMON, () => {
      if (!ui.hoveredCell.value || !ui.selectedCard.value) {
        return false;
      }
      return ui.selectedCard.value.canPlayAt(ui.hoveredCell.value.position);
    })
    .with(TARGETING_MODES.TARGETING, () => {
      return !!ui.selectedCard.value;
    })
    .exhaustive();
});

const position = computed(() => {
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.CARD_CHOICE,
      () => null
    )
    .with(TARGETING_MODES.SUMMON, () => ui.hoveredCell.value!.position)
    .with(TARGETING_MODES.TARGETING, () => ui.summonTarget.value)
    .exhaustive();
});

const textures = ref<Nullable<FrameObject[]>>();
const { assets } = useGame();

const isUnit = computed(
  () =>
    ui.selectedCard.value?.kind === CARD_KINDS.GENERAL ||
    ui.selectedCard.value?.kind === CARD_KINDS.MINION
);
watchEffect(async () => {
  if (
    !ui.selectedCard.value ||
    !ui.selectedCard.value.blueprint.spriteId ||
    !isUnit.value
  ) {
    textures.value = null;
    return;
  }

  const spritesheet = await assets.loadSpritesheet(
    ui.selectedCard.value?.blueprint.spriteId
  );
  textures.value = createSpritesheetFrameObject('breathing', spritesheet);
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
      v-if="textures"
      :alpha="0.5"
      :textures="textures"
      :scale-x="scaleX"
      :playing="true"
      :anchor-x="0.5"
      :anchor-y="0"
      :y="-CELL_HEIGHT"
    />
  </IsoPositioner>
</template>
