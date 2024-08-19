<script setup lang="ts">
const { gameType, ui, dispatch } = useGame();
const isActive = useIsActivePlayer();
const { isMobile } = useResponsive();
</script>

<template>
  <template v-if="gameType !== GAME_TYPES.SPECTATOR">
    <UiFancyButton
      v-if="isMobile"
      :style="{ '--hue': '10DEG', '--hue2': '20DEG' }"
      class="end-turn-button--mobile"
      :disabled="!isActive"
      @click="
        () => {
          dispatch('endTurn');
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      <Icon name="material-symbols-light:send-money" />
    </UiFancyButton>

    <UiFancyButton
      v-else
      :style="{ '--hue': '10DEG', '--hue2': '20DEG' }"
      class="end-turn-button"
      :disabled="!isActive"
      @click="
        () => {
          dispatch('endTurn');
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      End turn
    </UiFancyButton>
  </template>
</template>

<style scoped lang="postcss">
.end-turn-button {
  min-width: 10ch;
}
.end-turn-button--mobile {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  min-width: 0;
  padding: var(--size-3);

  font-size: var(--font-size-4);
}
</style>
