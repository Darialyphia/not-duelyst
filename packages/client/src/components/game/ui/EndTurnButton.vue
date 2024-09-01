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
      <span class="flex flex-col leading-snug">
        <span>End</span>
        <span>Turn</span>
      </span>
    </UiFancyButton>
  </template>
</template>

<style scoped lang="postcss">
.end-turn-button {
  width: var(--size-11);
  font-size: var(--font-size-1);

  aspect-ratio: 1;
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
