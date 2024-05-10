<script setup lang="ts">
import { match } from 'ts-pattern';

const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const isActivePlayer = useIsActivePlayer();
const { gameType } = useGame();
const isDisplayed = ref(false);

watch(
  () => activePlayer.value.id,
  () => {
    isDisplayed.value = true;
    setTimeout(() => {
      isDisplayed.value = false;
    }, 2000);
  },
  { immediate: true }
);

const message = computed(() => {
  return match(gameType.value)
    .with(GAME_TYPES.PVP, () => (isActivePlayer.value ? 'Your turn' : "Opponent's turn"))
    .otherwise(() => `${activePlayer.value.name}'s turn`);
});
</script>

<template>
  <Transition>
    <div v-if="isDisplayed" class="new-turn-indicator">
      <p>{{ message }}</p>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.new-turn-indicator {
  --offset: 25dvh;

  pointer-events: none;

  position: fixed;
  top: var(--offset);
  right: 0;
  left: 0;

  font-weight: 700;
  color: var(--primary);
  text-align: center;

  background: url('/assets/ui/new_turn.png');
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 3px 2px hsl(0 0% 0% / 0.7));
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.5s ease-out;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;

    > * {
      transform: translateY(-1rem);
    }
  }

  &:is(.v-enter-from, .v-leave-to)::before,
  &:is(.v-enter-from, .v-leave-to)::after {
    transform: scaleX(0);
  }
}

.new-turn-indicator::after,
.new-turn-indicator::before {
  content: '';

  position: absolute;

  width: 50%;
  height: 2px;

  background-color: var(--primary);

  transition: transform 0.5s;
}

.new-turn-indicator::before {
  top: -0.25rem;
  left: 0;
  transform-origin: 0% center;
}

.new-turn-indicator::after {
  top: calc(var(--font-size-8) + 2rem);
  right: 0;
  transform-origin: 100% center;
}

.new-turn-indicator > p {
  font-size: var(--font-size-8);
  transition: transform 0.5s;
}
</style>
