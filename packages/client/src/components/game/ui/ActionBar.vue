<script setup lang="ts">
import type { Unit } from '@game/sdk';
import { clamp, type Nullable } from '@game/shared';
import { Teleport } from 'vue';

const userPlayer = useUserPlayer();
const { ui, gameType, camera } = useGame();

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
  if (isMobile.value && !isMobileActive.value) return;
  ui.selectCardAtIndex(index);

  const rect = (e.target as HTMLElement).getBoundingClientRect();
  offset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  draggedIndex.value = index;

  const stopDragging = () => {
    nextTick(() => {
      draggedIndex.value = null;
    });
    document.body.removeEventListener('mouseup', stopDragging);
  };
  document.body.addEventListener('mouseup', stopDragging);
};

const isMobileActive = ref(false);
watchEffect(() => {
  if (ui.selectedCard.value) {
    isMobileActive.value = false;
  }
});
const { isMobile } = useResponsive();
</script>

<template>
  <div
    id="dragged-card"
    :style="{
      '--x': `${x - offset.x}px`,
      '--y': `${y - offset.y}px`,
      '--origin-x': `${offset.x}px`,
      '--origin-y': `${offset.y}px`,
      opacity: ui.hoveredCell.value ? 0.5 : 1
    }"
  />
  <Transition name="action-bar" appear>
    <div v-if="userPlayer" class="action-bar" :class="gameType.toLowerCase()">
      <TransitionGroup
        tag="ul"
        class="cards"
        :style="{
          '--angle': angle,
          '--hand-size': userPlayer.hand.length
        }"
        @mouseup="
          () => {
            if (isMobile) isMobileActive = true;
          }
        "
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
              <ActionBarItem
                :index="index"
                :blueprint="card.blueprint"
                :cost="card.cost"
                :attack="(card as Unit).attack"
                :max-hp="(card as Unit).maxHp"
                :pedestal-id="card.pedestalId"
                :card-back-id="card.cardBackId"
              />
            </div>
          </component>
        </li>
      </TransitionGroup>
    </div>
  </Transition>

  <div class="right-side">
    <ReplaceButton :dragged-index="draggedIndex" />
    <EndTurnButton />
  </div>

  <div class="mobile-left-side">
    <UiIconButton
      class="subtle-button"
      name="tabler:rotate-360"
      @click="camera.rotateCW"
    />
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

.cards {
  display: grid;
  align-self: start;
  justify-self: center;

  @screen lt-lg {
    transform: scale(0.8) translateX(var(--size-9));
  }
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
  &.active {
    @screen lt-lg {
      --angle: 0;
      --scale: 1;
      --offset-y: -60px;

      z-index: var(--hand-size);
    }
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

  @media (hover) and (pointer: fine) {
    &:hover {
      --offset-y: -90px;
      --angle: 0;
      --scale: 1;

      z-index: var(--hand-size);
    }
  }

  @screen lt-lg {
    --offset-y: 100px;
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

  @screen lt-lg {
    right: var(--size-4);
    bottom: calc(var(--size-12) - var(--size-2));
    flex-direction: column;
    gap: var(--size-1);
  }
}

.mobile-left-side {
  position: absolute;
  bottom: var(--size-10);
  left: var(--size-4);

  @screen lg {
    display: none;
  }
}
#dragged-card {
  pointer-events: none !important;

  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  transform-origin: var(--origin-x) var(--origin-y);
  transform: translateY(var(--y)) translateX(var(--x)) scale(0.5);

  /* opacity: var(--opacity); */

  transition: opacity 0.5s;
}

.action-bar-enter-from {
  --y-offset: var(--size-12);
}
</style>
