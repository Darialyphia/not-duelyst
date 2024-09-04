<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { Cell } from '@game/sdk';

const { cell } = defineProps<{ cell: CellViewModel }>();
const { session, assets, camera, ui, fx, pathfinding } = useGame();
const { settings } = useUserSettings();
const summonSheet = computed(() => assets.getSpritesheet('deploy-zone'));
const dangerSheet = computed(() => assets.getSpritesheet('bitmask-danger'));
const userPlayer = useUserPlayer();

const isMatch = (cellToTest: Cell) => {
  if (ui.targetingMode.value !== TARGETING_MODES.SUMMON) return false;
  if (!ui.selectedCard.value) return false;
  if (!isDefined(ui.selectedCardIndex.value)) return false;
  if (!userPlayer.value.canPlayCardAtIndex(ui.selectedCardIndex.value)) return false;

  return ui.selectedCard.value.canPlayAt(cellToTest.position, true);
};

const isEnabled = computed(() => {
  return !fx.isPlaying.value && isMatch(cell.getCell());
});

const bitmask = computed(() => {
  return getBitMask(session, cell.getCell(), camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});

const sheet = computed(() => {
  if (!isEnabled.value) return null;
  if (!settings.value.ui.displayDangerTiles) return summonSheet.value;

  const enemies = userPlayer.value.opponent.entities;
  return enemies.some(entity => {
    return pathfinding.canAttackAt(entity, cell.getCell());
  })
    ? dangerSheet.value
    : summonSheet.value;
});
</script>

<template>
  <BitmaskCell v-if="sheet" :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
