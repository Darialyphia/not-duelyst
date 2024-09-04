<script setup lang="ts">
import type { Player } from '@game/sdk';

const { player } = defineProps<{ player: Player }>();

const isGraveyardOpened = ref(false);
</script>

<template>
  <div class="hp">
    <Transition mode="out-in">
      <span :key="player.general?.hp.toFixed()">
        {{ player.general?.hp.toFixed() }}
      </span>
    </Transition>
  </div>
  <div class="gold">
    <Transition mode="out-in">
      <span :key="player.currentGold">
        {{ player.currentGold }}
      </span>
    </Transition>
  </div>
  <div class="cards">
    <Transition mode="out-in">
      <span :key="player.hand.length">
        {{ player.hand.length }}
      </span>
    </Transition>
  </div>
  <div class="graveyard" @click="isGraveyardOpened = true">
    <Transition mode="out-in">
      <span :key="player.graveyard.length">
        {{ player.graveyard.length }}
      </span>
    </Transition>
  </div>
  <GraveyardDrawer v-model:is-opened="isGraveyardOpened" :player="player" />
</template>

<style scoped lang="postcss">
.hp {
  background-image: url('/assets/ui/hero-portrait-hp.png');
}

.gold {
  background-image: url('/assets/ui/hero-portrait-gold.png');
}

.cards {
  background-image: url('/assets/ui/hero-portrait-cards.png');
}

.graveyard {
  background-image: url('/assets/ui/hero-portrait-graveyard.png');
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
</style>
