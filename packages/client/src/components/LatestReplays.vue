<script setup lang="ts">
import type { GameDto } from '@game/api/src/convex/game/game.mapper';

const { games } = defineProps<{ games: GameDto[] }>();

const assets = useAssets();
</script>

<template>
  <div v-if="!assets.loaded.value" class="fancy-surface">Loading games...</div>
  <div v-else class="fancy-surface">
    <p v-if="!games.length">No replays are available at the moment. Check back later !</p>

    <GameCard
      v-for="game in games"
      :key="game._id"
      :game="game"
      :link="{
        name: 'Replay',
        params: { id: game._id }
      }"
    />
  </div>
</template>
