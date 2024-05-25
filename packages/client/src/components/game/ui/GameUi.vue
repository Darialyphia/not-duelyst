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
    return !!ui.highlightedCard.value;
  },
  set(val) {
    if (!val) {
      ui.highlightedCard.value = null;
    }
  }
});
</script>

<template>
  <EndGameModal v-if="winner" />

  <template v-else>
    <TeamInfos />
    <SkillBar />
    <ActionBar />
    <TargetingUi />
    <BlueprintFollowupUi />
    <GameMenu />
    <NewTurnIndicator />
    <CombatLog />

    <CardModal
      v-if="ui.highlightedCard.value"
      v-model:is-opened="isModalOpened"
      :blueprint-id="ui.highlightedCard.value.blueprintId"
      disable-right-click
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
            factions: entity.card.blueprint.factions,
            tribes: entity.card.blueprint.tribes ?? []
          }"
        />
        <dl>
          <div v-for="keyword in entity.keywords" :key="keyword.id">
            <dt>
              {{ keyword.name }}
              {{ keyword.stacks ? `(x${keyword.stacks})` : '' }}
            </dt>
            <dd>{{ keyword.description }}</dd>
          </div>
        </dl>
      </div>
    </Transition>

    <Transition>
      <div v-if="!entity && ui.hoveredCell.value?.tile" class="tile-preview">
        <TileCard :tile="ui.hoveredCell.value.tile" />
      </div>
    </Transition>
  </template>
</template>

<style scoped lang="postcss">
.card-preview {
  pointer-events: none;
  position: absolute;
  z-index: 1;
  top: 13rem;
  &.left {
    left: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-50%) rotateY(45deg);
    }
  }
  &.right {
    right: var(--size-5);
    > * {
      margin-left: auto;
    }
    > dl {
      direction: rtl;
      > * {
        direction: ltr;
      }
    }
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

.tile-preview {
  pointer-events: none;

  position: absolute;
  z-index: 1;
  top: 13rem;
  left: var(--size-5);
  &:is(.v-enter-from, .v-leave-to) {
    transform: translateX(-50%) rotateY(45deg);
  }
}

dl {
  display: grid;
  grid-auto-flow: column;
  grid-gap: var(--size-2);
  grid-template-rows: repeat(3, 1fr);

  margin-top: var(--size-3);
}
dl > div {
  padding: var(--size-3);

  font-size: var(--font-size-0);

  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2);
}
</style>
