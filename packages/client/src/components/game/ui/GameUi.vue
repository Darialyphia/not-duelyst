<script setup lang="ts">
const { ui } = useGame();

const entity = computed(() => {
  return ui.highlightedEntity.value ?? ui.hoveredEntity.value;
});
</script>

<template>
  <TeamInfos />
  <SkillBar />
  <ActionBar />
  <TargetingUi />
  <GameMenu />
  <NewTurnIndicator />

  <Transition>
    <div
      v-if="entity"
      class="card-preview"
      :class="entity.player.isPlayer1 ? 'left' : 'right'"
    >
      <Card
        :card="{
          name: entity.card.blueprint.name,
          description: entity.card.blueprint.description,
          kind: entity.card.kind,
          spriteId: entity.card.blueprint.spriteId,
          rarity: entity.card.blueprint.rarity,
          attack: entity.attack,
          hp: entity.hp,
          speed: entity.speed,
          cost: entity.card.cost,
          cooldown: entity.card.cooldown,
          skills: entity.card.blueprint.skills,
          pedestalId: entity.card.pedestalId,
          factions: entity.card.blueprint.factions
        }"
      />
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.card-preview {
  position: absolute;
  z-index: 1;
  top: 14rem;
  &.left {
    left: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-50%) rotateY(45deg);
    }
  }
  &.right {
    right: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(50%) rotateY(-45deg);
    }
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}
</style>
