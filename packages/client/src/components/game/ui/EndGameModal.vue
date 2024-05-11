<script setup lang="ts">
import { Player } from '@game/sdk';

const { session } = useGame();

const winner = ref<Player | null>(null);
const userPlayer = useUserPlayer();

session.on('game:ended', winnerId => {
  winner.value = session.playerSystem.getPlayerById(winnerId)!;
});

const result = computed(() =>
  winner.value?.equals(userPlayer.value) ? 'Victory' : 'Defeat'
);
</script>

<template>
  <UiModal :closable="false" :is-opened="!!winner" :title="result">
    <NuxtLink :to="{ name: 'ClientHome' }">Back to main menu</NuxtLink>
  </UiModal>
</template>
