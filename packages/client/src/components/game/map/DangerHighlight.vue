<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: CellViewModel }>();
const { session, assets, camera, ui, pathfinding, fx } = useGame();

const sheet = computed(() => assets.getSpritesheet('bitmask-danger'));

const isMatch = (cellToTest: Cell) => {
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.TARGETING,
      TARGETING_MODES.CARD_CHOICE,
      () => false
    )
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (ui.hoveredEntity.value.belongsToActivePlayer) return false;

      return pathfinding.canAttackAt(ui.hoveredEntity.value, cellToTest);
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && isMatch(cell.getCell()));

const bitmask = computed(() => {
  return getBitMask(session, cell.getCell(), camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});
</script>

<template>
  <BitmaskCell :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
