<script setup lang="ts">
import { clamp, rectToBBox, type Nullable } from '@game/shared';
import { Teleport } from 'vue';

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

const draggedIndex = ref<Nullable<number>>();
const { x, y } = useMouse();
const offset = ref({ x: 0, y: 0 });

const onMouseDown = (e: MouseEvent, index: number) => {
  console.log(index);
  if (userPlayer.value.canPlayCardAtIndex(index)) {
    ui.selectCardAtIndex(index);
  }

  const rect = (e.target as HTMLElement).getBoundingClientRect();
  offset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  draggedIndex.value = index;

  const stopDragging = () => {
    draggedIndex.value = null;
    document.body.removeEventListener('mouseup', stopDragging);
  };
  document.body.addEventListener('mouseup', stopDragging);
};
</script>

<template>
  <div
    id="dragged-card"
    :style="{
      '--x': `${x - offset.x}px`,
      '--y': `${y - offset.y}px`,
      '--opacity': ui.hoveredCell.value ? 0.5 : 1
    }"
  />
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
        :key="`${card.index}:${card.player.id}`"
        class="card-wrapper"
        :class="[
          {
            selected: card && ui.selectedCard.value === card,
            dragging: draggedIndex === index
          }
        ]"
        :style="{ '--index': index }"
        @mousedown="onMouseDown($event, index)"
      >
        <component :is="draggedIndex === index ? Teleport : 'div'" to="#dragged-card">
          <div @mouseup="draggedIndex = null">
            <ActionBarItem :index="index" :player-id="userPlayer.id" />
          </div>
        </component>
      </li>
    </TransitionGroup>
  </div>

  <div class="right-side">
    <UiFancyButton
      v-if="gameType !== GAME_TYPES.SPECTATOR"
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      class="replace-button"
      :disabled="
        !isActive || !isDefined(ui.selectedCardIndex.value) || !userPlayer.canReplace
      "
      :class="{ dragging: isDefined(draggedIndex) }"
      @click="
        () => {
          dispatch('replace', { cardIndex: ui.selectedCardIndex.value! });
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      Replace
    </UiFancyButton>
    <UiFancyButton
      v-if="gameType !== GAME_TYPES.SPECTATOR"
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
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  --y-offset: var(--size-11);

  pointer-events: none;

  position: absolute;
  bottom: calc(-1 * var(--size-10));
  left: 50%;
  transform: translateX(-50%) translateY(var(--y-offset));

  display: flex;
  gap: var(--size-5);
  align-items: center;
  justify-content: center;

  width: fit-content;

  transition: transform 0.2s ease-in;

  &:hover {
    --y-offset: 0;
  }

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
  min-width: 10ch;
}

.cards {
  display: grid;
  align-self: start;
  justify-self: center;
}

.card-wrapper {
  --base-angle: calc((var(--hand-size) / 2) * var(--angle) * -1deg);
  --offset-step: 125px;
  --base-offset: calc((var(--hand-size) / 2) * var(--offset-step) * -1);
  --offset-y: 0;
  --scale: 0.85;

  pointer-events: all;
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

  &.selected {
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
    &:not(:hover) {
      --scale: 0.9;
    }
  }

  &:hover {
    --offset-y: -90px;
    --angle: 0;
    --scale: 1;

    z-index: var(--hand-size);
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.5s,
      opacity 0.5s,
      filter 0.5s;
  }

  &:is(.v-leave-to) {
    --offset-y: -150px;

    opacity: 0;
    filter: brightness(1000%) contrast(300%);
  }

  .action-bar:not(.sandbox) &:is(.v-enter-from) {
    --scale: 0;

    opacity: 0;
    filter: brightness(1000%) contrast(300%);
  }
}

.right-side {
  position: absolute;
  right: var(--size-11);
  bottom: var(--size-4);

  display: flex;
  gap: var(--size-3);
  align-items: flex-end;

  height: var(--size-9);
}

#dragged-card {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  transform-origin: top left;
  transform: translateY(var(--y)) translateX(var(--x)) scale(0.5);

  opacity: var(--opacity);

  transition: opacity 0.3s;
}

.replace-button {
  &:not(:disabled):hover {
    scale: 1.1;
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
  }
}
</style>
