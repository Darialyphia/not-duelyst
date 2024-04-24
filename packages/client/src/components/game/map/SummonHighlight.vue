<script setup lang="ts">
import type { Cell } from '@game/sdk';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, fx } = useGame();

const sheet = computed(() => assets.getSpritesheet('deploy-zone'));

const isMatch = (cellToTest: Cell) => {
  if (ui.targetingMode.value !== TARGETING_MODES.SUMMON) return false;
  if (!ui.selectedCard.value) return false;

  return ui.selectedCard.value.canPlayAt(cellToTest.position);
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
