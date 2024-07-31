<script setup lang="ts">
import { isDefined, type Nullable } from '@game/shared';
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: CellViewModel }>();
const { session, assets, camera, ui, fx } = useGame();
const userPlayer = useUserPlayer();
const targetSheet = computed(() => assets.getSpritesheet('deploy-zone'));
const highlightSheet = computed(() => assets.getSpritesheet('skill-targeting'));

const canHighlight = (cellToTest: CellViewModel) => {
  return ui.selectedCard.value?.blueprint.shouldHighlightCell(cellToTest.getCell(), {
    session,
    playedPoint: ui.summonTarget.value ?? undefined,
    targets: [
      ...ui.cardTargets.value,
      canTarget(ui.hoveredCell.value) ? ui.hoveredCell.value : null
    ].filter(isDefined),
    card: ui.selectedCard.value!
  });
};

const isHighlighted = computed(() => canHighlight(cell));

const canTarget = (cellToTest: Nullable<Cell>) => {
  if (!cellToTest) return false;
  return (
    ui.selectedCard.value?.blueprint.targets?.isTargetable(cellToTest, {
      session,
      playedPoint: ui.summonTarget.value ?? undefined,
      card: ui.selectedCard.value,
      targets: ui.cardTargets.value
    }) ?? false
  );
};

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
      return canTarget(cellToTest);
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && !!isMatch(cell.getCell()));

const bitmask = computed(() => {
  return getBitMask(session, cell.getCell(), camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return !!isMatch(neighbor);
  });
});

const sheet = computed(() => {
  if (isHighlighted.value) return null;
  return targetSheet.value;
});

const highlightTexture = computed(() => Object.values(highlightSheet.value.textures)[0]);
</script>

<template>
  <BitmaskCell v-if="sheet" :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
  <Sprite
    v-if="isHighlighted"
    :anchor="0.5"
    event-mode="none"
    :texture="highlightTexture"
  />
</template>
