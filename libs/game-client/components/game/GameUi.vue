<script setup lang="ts">
const { playerId } = defineProps<{ playerId: string | null }>();
const { gameSession, state } = useGame();
const { selectedEntity, hoveredCell } = useGameUi();
</script>

<template>
  <PlayerInfos />

  <Transition>
    <div
      v-if="selectedEntity"
      :key="selectedEntity.id"
      class="selected-entity"
      :class="selectedEntity.player.equals(state.players[0]) ? 'left' : 'right'"
    >
      <UnitCard :entity="selectedEntity" />
    </div>
  </Transition>

  <div class="game-action-bar">
    <ActionBar />
  </div>
  <div class="debug">
    <pre>
turn: {{ state.turn }} x: {{ hoveredCell?.position.x }}, y: {{
        hoveredCell?.position.y
      }}, z: {{ hoveredCell?.position.z }}</pre
    >
    <pre>playerId: {{ playerId }}</pre>
    <button
      @click="
        () => {
          console.log({ gameSession, state });
        }
      "
    >
      Debug
    </button>
  </div>
  <div class="menu">
    <GameMenu />
  </div>
  <!-- <GameChat /> -->

  <!-- <UiIconButton
    icon="ic:sharp-emoji-flags"
    :theme="{ size: 'font-size-5' }"
    title="Surrender"
    class="surrender-button"
    @click="surrender"
  /> -->
</template>

<style scoped>
.selected-entity {
  position: absolute;
  top: 14rem;
  &.left {
    left: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-50%);
      opacity: 0;
    }
  }
  &.right {
    right: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(50%);
      opacity: 0;
    }
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateX(-50%);
    opacity: 0;
  }
}

.game-action-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.debug {
  position: absolute;
  bottom: 0;
  left: 0;

  padding: 1em;

  font-family: monospace;
  font-size: var(--font-size-0);
  color: white;

  background-color: rgba(0, 0, 0, 0.5);
}

.menu {
  position: absolute;
  right: var(--size-3);
  bottom: var(--size-3);
}
</style>
