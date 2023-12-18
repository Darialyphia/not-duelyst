<script setup lang="ts">
const { selectedEntity } = useGameUi();
</script>

<template>
  <!-- <PlayersInfos /> -->
  <div class="atb-timeline">
    <ATBTimeline />
  </div>

  <Transition>
    <div v-if="selectedEntity" class="selected-entity">
      <UnitCard :entity="selectedEntity" />
    </div>
  </Transition>

  <div class="game-action-bar">
    <ActionBar />
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
  left: var(--size-5);

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
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);
}

.atb-timeline {
  position: absolute;
  top: 50%;
  right: var(--size-4);
  transform: translateY(-50%);
}
</style>
