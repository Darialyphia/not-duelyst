<script setup lang="ts">
import type { Cell } from '@game/sdk';
import type { CellId } from '@game/sdk/src/board/cell';
import { match } from 'ts-pattern';

const { cellId } = defineProps<{ cellId: CellId }>();
const { session, assets, camera, ui, pathfinding, fx } = useGame();
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const sheet = computed(() => assets.getSpritesheet('bitmask-movement-ally'));

const isActivePlayer = useIsActivePlayer();
const userPlayer = useUserPlayer();

const isMatch = (cellToTest: Cell) => {
  if (!isActivePlayer.value) return false;

  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.FOLLOWUP,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.SKILL,
      TARGETING_MODES.BLUEPRINT_FOLLOWUP,
      () => false
    )
    .with(TARGETING_MODES.BASIC, () => {
      if (!userPlayer.value?.equals(ui.selectedEntity.value!.player)) return false;

      return pathfinding.canMoveTo(ui.selectedEntity.value!, cellToTest);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (!ui.hoveredEntity.value.player.equals(activePlayer.value)) return false;

      return pathfinding.canMoveTo(ui.hoveredEntity.value, cellToTest);
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && isMatch(cell.value));

const bitmask = computed(() => {
  return getBitMask(session, cell.value, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});
</script>

<template>
  <BitmaskCell :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
