<script setup lang="ts">
const { playerId } = defineProps<{ playerId: string }>();
const player = useGameSelector(session => session.playerSystem.getPlayerById(playerId)!);
const isGraveyardOpened = ref(false);
</script>

<template>
  <Transition appear>
    <div class="hp">
      <Transition mode="out-in">
        <span :key="player.general?.hp.toFixed()">
          {{ player.general?.hp.toFixed() }}
        </span>
      </Transition>
    </div>
  </Transition>

  <Transition appear>
    <div class="gold">
      <Transition mode="out-in">
        <span :key="player.currentGold">
          {{ player.currentGold }}
        </span>
      </Transition>
    </div>
  </Transition>

  <Transition appear>
    <div class="cards">
      <Transition mode="out-in">
        <span :key="player.hand.length">
          {{ player.hand.length }}
        </span>
      </Transition>
    </div>
  </Transition>

  <Transition appear>
    <div class="graveyard" @click="isGraveyardOpened = true">
      <Transition mode="out-in">
        <span :key="player.graveyard.length">
          {{ player.graveyard.length }}
        </span>
      </Transition>
    </div>
  </Transition>

  <GraveyardDrawer v-model:is-opened="isGraveyardOpened" :player-id="playerId" />
</template>

<style scoped lang="postcss">
.hp {
  background-image: url('/assets/ui/hero-portrait-hp.png');
  --delay: 0;
}

.gold {
  background-image: url('/assets/ui/hero-portrait-gold.png');
  --delay: 200ms;
}

.cards {
  background-image: url('/assets/ui/hero-portrait-cards.png');
  --delay: 400ms;
}

.graveyard {
  background-image: url('/assets/ui/hero-portrait-graveyard.png');
  --delay: 600ms;
}

:is(.gold, .hp, .cards, .graveyard) {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 64px;

  background-size: cover;
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
}

.v-enter-active {
  transition: all 0.5s var(--ease-3);
  transition-delay: var(--delay);
}

.v-enter-from {
  transform: rotateY(90deg);
  opacity: 0;
}
</style>
