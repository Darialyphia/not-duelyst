<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: CellViewModel }>();
const { session, assets, camera, ui, pathfinding, fx } = useGame();
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const { settings } = useUserSettings();
const safeSheet = computed(() => assets.getSpritesheet('bitmask-movement-ally'));
const dangerSheet = computed(() => assets.getSpritesheet('bitmask-danger'));

const isActivePlayer = useIsActivePlayer();
const userPlayer = useUserPlayer();

const isMatch = (cellToTest: Cell) => {
  if (!isActivePlayer.value) return false;

  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.TARGETING,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.CARD_CHOICE,
      () => false
    )
    .with(TARGETING_MODES.BASIC, () => {
      if (!ui.selectedEntity.value) return false;
      if (!userPlayer.value?.equals(ui.selectedEntity.value.player)) return false;

      return pathfinding.canMoveTo(ui.selectedEntity.value!, cellToTest);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (!ui.hoveredEntity.value.player.equals(activePlayer.value)) return false;

      return pathfinding.canMoveTo(ui.hoveredEntity.value, cellToTest);
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

const sheet = computed(() => {
  if (!isEnabled.value) return null;
  if (!settings.value.ui.displayDangerTiles) return safeSheet.value;

  const enemies = userPlayer.value.opponent.entities;
  return enemies.some(entity => {
    return pathfinding.canAttackAt(entity, cell.getCell());
  })
    ? dangerSheet.value
    : safeSheet.value;
});
</script>

<template>
  <BitmaskCell v-if="sheet" :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
