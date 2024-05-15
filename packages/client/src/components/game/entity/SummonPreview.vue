<script setup lang="ts">
import { AnimatedSprite, TextStyle } from 'pixi.js';
import { match } from 'ts-pattern';

const { camera, assets, ui } = useGame();

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
      TARGETING_MODES.SKILL,
      TARGETING_MODES.BLUEPRINT_FOLLOWUP,
      () => false
    )
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
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SKILL,
      TARGETING_MODES.BLUEPRINT_FOLLOWUP,
      () => null
    )
    .with(TARGETING_MODES.SUMMON, () => ui.hoveredCell.value!.position)
    .with(TARGETING_MODES.FOLLOWUP, () => ui.summonTarget.value)
    .exhaustive();
});

const textStyle = new TextStyle({
  fontSize: 20,
  fontWeight: '700',
  fill: 'red',
  stroke: 'black',
  strokeThickness: 4
});

const entityTextures = useIlluminatedTexture(
  () => ui.selectedCard.value?.blueprint.spriteId,
  'breathing'
);
const goldCostTextures = useIlluminatedTexture('summon-cost-gold', 'idle');
const hpCostTextures = useIlluminatedTexture('summon-cost-hp', 'idle');
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
    <IlluminatedSprite
      v-if="entityTextures.diffuse && entityTextures.normal"
      :alpha="0.5"
      :diffuse-textures="entityTextures.diffuse"
      :normal-textures="entityTextures.normal"
      :scale-x="scaleX"
      :playing="true"
      :anchor-x="0.5"
      :anchor-y="0"
      :y="-CELL_HEIGHT"
    />

    <container :x="CELL_WIDTH * 0.25" :y="-10">
      <pixi-text :scale="0.5" :style="textStyle" :anchor="0.5">
        - {{ ui.selectedCard.value!.cost }}
      </pixi-text>
      <IlluminatedSprite
        v-if="goldCostTextures.diffuse && goldCostTextures.normal"
        :x="15"
        :event-mode="'none'"
        :diffuse-textures="goldCostTextures.diffuse"
        :normal-textures="goldCostTextures.normal"
        :scale-x="scaleX"
        :anchor="0.5"
        :playing="false"
      />
    </container>

    <container v-if="ui.selectedCard.value?.hpCost" :x="CELL_WIDTH * 0.25" :y="5">
      <pixi-text :scale="0.5" :style="textStyle" :anchor="0.5">
        - {{ ui.selectedCard.value!.hpCost }}
      </pixi-text>
      <IlluminatedSprite
        v-if="hpCostTextures.diffuse && hpCostTextures.normal"
        :x="15"
        :event-mode="'none'"
        :diffuse-textures="hpCostTextures.diffuse"
        :normal-textures="hpCostTextures.normal"
        :scale-x="scaleX"
        :anchor="0.5"
        :playing="false"
      />
    </container>
  </IsoPositioner>
</template>
