<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, fx } = useGame();

const sheet = computed(() => assets.getSpritesheet('deploy-zone'));

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
      return (
        ui.selectedCard.value.blueprint.targets?.isTargetable(cellToTest, {
          session,
          playedPoint: ui.summonTarget.value ?? undefined,
          card: ui.selectedCard.value,
          targets: ui.cardTargets.value
        }) ?? false
      );
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && isMatch(cell));

const bitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});
</script>

<template>
  <BitmaskCell :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
