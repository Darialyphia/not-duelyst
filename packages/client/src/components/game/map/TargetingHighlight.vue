<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: CellViewModel }>();
const { session, assets, camera, ui, fx } = useGame();
const userPlayer = useUserPlayer();
const targetSheet = computed(() => assets.getSpritesheet('deploy-zone'));
const highlightSheet = computed(() => assets.getSpritesheet('skill-targeting'));

const canHighlight = (cellToTest: CellViewModel) => {
  return ui.highlightableCells.value.some(c => c.equals(cellToTest.getCell()));
};

const isHighlighted = computed(() => canHighlight(cell));

const isMatch = (cellToTest: Cell) => {
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.NONE,
      TARGETING_MODES.CARD_CHOICE,
      () => false
    )
    .with(TARGETING_MODES.TARGETING, () => {
      if (!ui.selectedCard.value) return false;
      if (!isDefined(ui.selectedCardIndex.value)) return false;
      if (!userPlayer.value.canPlayCardAtIndex(ui.selectedCardIndex.value)) return false;
      return ui.targetableCells.value.some(cell => cell.equals(cellToTest));
    })
    .exhaustive();
};

const isEnabled = () => {
  if (fx.isPlaying.value) return false;

  return !fx.isPlaying.value && !!isMatch(cell.getCell());
};

const bitmask = computed(() => {
  const res = getBitMask(session, cell.getCell(), camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return !!isMatch(neighbor);
  });

  return res;
});

const sheet = computed(() => {
  if (isHighlighted.value) return null;
  return targetSheet.value;
});

const highlightTexture = computed(() => Object.values(highlightSheet.value.textures)[0]);
</script>

<template>
  <BitmaskCell v-if="sheet" :bitmask="bitmask" :is-enabled="isEnabled()" :sheet="sheet" />
  <Sprite
    v-if="isHighlighted"
    :anchor="0.5"
    event-mode="none"
    :texture="highlightTexture"
  />
</template>
