<script setup lang="ts">
import { type SimulationResult } from '@game/sdk';
import { isDefined } from '@game/shared';
import { type FrameObject } from 'pixi.js';
import { match } from 'ts-pattern';

const { assets, camera, ui, session, simulationResult } = useGame();

const scaleX = computed(() => {
  let value = ui.selectedCard.value!.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = {
  width: session.boardSystem.width,
  height: session.boardSystem.height
};

const userPlayer = useUserPlayer();
const isDisplayed = computed(() => {
  if (!isDefined(ui.selectedCardIndex.value)) return false;
  if (!userPlayer.value.canPlayCardAtIndex(ui.selectedCardIndex.value)) return false;
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

const displayedEntities = ref([]) as Ref<
  Array<SimulationResult['newEntities'][number] & { textures: FrameObject[] }>
>;
watchEffect(async () => {
  if (!simulationResult.value) {
    displayedEntities.value = [];
    return;
  }
  displayedEntities.value = await Promise.all(
    simulationResult.value.newEntities.map(async entity => {
      const spritesheet = await assets.loadSpritesheet(entity.spriteId);
      return {
        ...entity,
        textures: createSpritesheetFrameObject('breathing', spritesheet)
      };
    })
  );
});
</script>

<template>
  <template v-if="isDisplayed">
    <IsoPositioner
      v-for="entity in displayedEntities"
      :key="entity.id"
      :animated="false"
      v-bind="entity.position"
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
        :textures="entity.textures"
        :scale-x="scaleX"
        :playing="true"
        :anchor-x="0.5"
        :anchor-y="1"
        :y="CELL_HEIGHT * 0.65"
      />
    </IsoPositioner>
  </template>
</template>
