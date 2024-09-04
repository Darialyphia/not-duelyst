<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import EndGameModal from './EndGameModal.vue';
import Stats from 'stats.js';
import { GAME_PHASES } from '@game/sdk/src/game-session';

const { ui, session } = useGame();

const entity = computed(() => {
  return ui.hoveredEntity.value;
});

const winner = ref<string | null>(null);

const phase = useGameSelector(session => session.phase);

session.on('game:ended', winnerId => {
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

const isDev = import.meta.env.DEV;
const stats = new Stats();

const statsRoot = ref<HTMLDivElement>();
onMounted(() => {
  stats.showPanel(0);
  statsRoot.value?.appendChild(stats.dom);
});

stats.begin();
onTick(() => {
  stats.end();
  stats.begin();
});
</script>

<template>
  <div v-if="isDev" ref="statsRoot" class="absolute bottom-10 left-5" />
  <EndGameModal v-if="winner" />

  <MulliganOverlay v-else-if="phase === GAME_PHASES.MULLIGAN" />
  <template v-else>
    <TeamInfos />
    <ActionBar />
    <TargetingUi />
    <CardChoiceUi />
    <NewTurnIndicator />
    <CombatLog />
    <PlayedCard />
    <CardModal
      v-if="ui.highlightedCard.value"
      v-model:is-opened="isModalOpened"
      :blueprint-id="ui.highlightedCard.value.blueprintId"
      :cardback-id="ui.highlightedCard.value.cardBackId"
      disable-right-click
    />

    <Transition v-if="phase === GAME_PHASES.BATTLE">
      <div
        v-if="entity"
        class="card-preview"
        :class="entity.player.isPlayer1 ? 'left' : 'right'"
      >
        <Card
          :card="{
            blueprintId: entity.card.blueprint.id,
            name: entity.card.name,
            description: entity.card.description,
            kind: entity.card.kind,
            spriteId: entity.card.blueprint.spriteId,
            rarity: entity.card.blueprint.rarity,
            attack: entity.attack,
            hp: entity.hp,
            speed: entity.speed,
            cost: entity.card.cost,
            pedestalId: entity.card.pedestalId,
            cardbackId: entity.card.cardBackId,
            faction: entity.card.blueprint.faction,
            tags: entity.card.blueprint.tags ?? []
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
  <GameMenu />
</template>

<style scoped lang="postcss">
.card-preview {
  pointer-events: none;
  position: absolute;
  z-index: 1;
  top: 16rem;

  @screen lt-lg {
    top: 0;
  }
  &.left {
    left: var(--size-5);

    @screen lt-lg {
      left: 0;
    }
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-50%) rotateY(45deg);
    }
  }
  &.right {
    right: var(--size-5);

    @screen lt-lg {
      right: 0;
    }
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
