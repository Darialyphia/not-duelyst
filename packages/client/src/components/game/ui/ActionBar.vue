<script setup lang="ts">
import { clamp } from '@game/shared';

const userPlayer = useUserPlayer();
const { ui, gameType, dispatch } = useGame();
const isActive = useIsActivePlayer();

const MAX_ANGLE = 30;
const angle = computed(() => {
  return (
    clamp(userPlayer.value.hand.length * 10, 0, MAX_ANGLE) /
    Math.max(userPlayer.value.hand.length, 1)
  );
});
</script>

<template>
  <!-- <div v-if="userPlayer && gameType === GAME_TYPES.SPECTATOR" class="opponent-action-bar">
    <div class="flex gap-5 iems-center">
      <ActionBarItem
        v-for="(card, index) in userPlayer.opponent.hand"
        :key="`${card?.blueprintId}:${index}`"
        :index="index"
        :player-id="userPlayer.opponent.id"
      />
    </div>
  </div> -->
  <div v-if="userPlayer" class="action-bar" :class="gameType.toLowerCase()">
    <TransitionGroup
      tag="ul"
      class="cards"
      :style="{
        '--angle': angle,
        '--hand-size': userPlayer.hand.length
      }"
    >
      <li
        v-for="(card, index) in userPlayer.hand"
        :key="`${card?.blueprintId}:${index}`"
        class="card-wrapper"
        :class="[
          {
            selected: card && ui.selectedCard.value === card
          }
        ]"
        :style="{ '--index': index }"
      >
        <ActionBarItem :index="index" :player-id="userPlayer.id" />
      </li>
    </TransitionGroup>
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
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: calc(-1 * var(--size-10));
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

.end-turn-button {
  position: absolute;
  right: var(--size-11);
  bottom: var(--size-4);
  min-width: 10ch;
}

.cards {
  display: grid;
  align-self: start;
  justify-self: center;
}

.card-wrapper {
  --base-angle: calc((var(--hand-size) / 2) * var(--angle) * -1deg);
  --offset-step: 120px;
  --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
  --offset-y: 0;
  --scale: 0.7;

  cursor: pointer;

  position: relative;
  z-index: var(--index);
  transform-origin: center 120%;
  transform: translateY(var(--offset-y))
    translateX(calc(var(--base-offset) + var(--index) * var(--offset-step)))
    rotateZ(calc(var(--base-angle) + var(--index) * var(--angle) * 1deg))
    scale(var(--scale));

  grid-column: 1;
  grid-row: 1;

  transition: transform 0.15s ease-in;
  &:hover {
    --offset-y: -90px;
    --angle: 0;
    --scale: 1;

    z-index: var(--hand-size);
  }

  .action-bar:not(.sandbox) & {
    :is(.v-enter-active, .v-leave-active) {
      transition:
        opacity 0.5s,
        filter 0.5s;
    }

    &:is(.v-leave-to) {
      opacity: 0;
      filter: brightness(1000%) contrast(300%);
    }

    &:is(.v-enter-from) {
      filter: brightness(1000%) contrast(300%);
    }
  }
}
</style>
