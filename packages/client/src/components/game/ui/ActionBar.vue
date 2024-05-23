<script setup lang="ts">
const { dispatch, ui, gameType } = useGame();

const userPlayer = useUserPlayer();
const isActive = useIsActivePlayer();
</script>

<template>
  <div v-if="userPlayer && gameType === GAME_TYPES.SPECTATOR" class="opponent-action-bar">
    <div class="flex gap-5 iems-center">
      <ActionBarItem
        v-for="(card, index) in userPlayer.opponent.hand"
        :key="`${card?.blueprintId}:${index}`"
        :index="index"
        :player-id="userPlayer.opponent.id"
      />
    </div>
  </div>
  <div v-if="userPlayer" class="action-bar">
    <div class="flex gap-5 iems-center">
      <ActionBarItem
        v-for="(card, index) in userPlayer.hand"
        :key="`${card?.blueprintId}:${index}`"
        :index="index"
        :player-id="userPlayer.id"
      />
    </div>
    <UiFancyButton
      v-if="gameType !== GAME_TYPES.SPECTATOR"
      :style="{ '--hue': '10DEG', '--hue2': '20DEG' }"
      class="end-turn-button"
      :diabled="!isActive"
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
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-5);
  align-items: center;
  justify-content: center;

  width: fit-content;

  @screen lt-lg {
    bottom: var(--size-2);
    width: 100%;
  }

  button {
    align-self: stretch;
    width: fit-content;
  }
}

.opponent-action-bar {
  position: absolute;
  bottom: var(--size-11);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-5);
  align-items: center;
  justify-content: center;

  width: fit-content;
}

.endy-turn-button {
  min-width: 10ch;
}
</style>
