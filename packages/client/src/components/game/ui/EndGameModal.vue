<script setup lang="ts">
const winner = useGameSelector(session => {
  return session.winnerId ? session.playerSystem.getPlayerById(session.winnerId) : null;
});

const userPlayer = useUserPlayer();

const result = computed(() =>
  winner.value?.equals(userPlayer.value) ? 'Victory' : 'Defeat'
);
</script>

<template>
  <UiModal :closable="false" :is-opened="!!winner" :title="result">
    <NuxtLink :to="{ name: 'ClientHome' }">Back to main menu</NuxtLink>
  </UiModal>
</template>
