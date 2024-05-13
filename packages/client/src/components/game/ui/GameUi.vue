<script setup lang="ts">
import EndGameModal from './EndGameModal.vue';

const { ui, session } = useGame();

const entity = computed(() => {
  return ui.hoveredEntity.value;
});

const winner = ref<string | null>(null);

session.on('game:ended', winnerId => {
  console.log('game ended');
  winner.value = winnerId;
});

const isModalOpened = computed({
  get() {
    return !!ui.highlightedEntity.value;
  },
  set(val) {
    if (!val) {
      ui.highlightEntity(null);
    }
  }
});
</script>

<template>
  <TeamInfos v-if="!winner" />
  <SkillBar v-if="!winner" />
  <ActionBar v-if="!winner" />
  <TargetingUi />
  <GameMenu />
  <NewTurnIndicator />
  <EndGameModal />
  <CardModal
    v-if="ui.highlightedEntity.value"
    v-model:is-opened="isModalOpened"
    :blueprint-id="ui.highlightedEntity.value.card.blueprintId"
  />
  <Transition>
    <div
      v-if="entity"
      class="card-preview"
      :class="entity.player.isPlayer1 ? 'left' : 'right'"
    >
      <Card
        :card="{
          blueprintId: entity.card.blueprint.id,
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
      <dl>
        <div v-for="keyword in entity.keywords" :key="keyword.id">
          <dt>
            {{ keyword.name }}
            {{ keyword.stacks && keyword.stacks > 1 ? `(x${keyword.stacks})` : '' }}
          </dt>
          <dd>{{ keyword.description }}</dd>
        </div>
      </dl>
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

dl > div {
  margin-block: var(--size-2);
  padding: var(--size-3);
  font-size: var(--font-size-0);
  background-color: black;
}
</style>
