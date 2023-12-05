<script setup lang="ts">
import type { Entity } from '@hc/sdk/src/entity/entity';
import type { GameSession, GameState } from '../../sdk/src';

const { gameSession } = defineProps<{ gameSession: GameSession }>();

const state = ref(gameSession.getState());

let unsub: () => void | undefined;
onMounted(() => {
  gameSession.subscribe(event => {
    state.value = gameSession.getState();
  });
});

onUnmounted(() => {
  unsub?.();
});
const activeEntity = computed<Entity>(() => state.value.activeEntity as Entity);
</script>

<template>
  <div class="p-5 bg-surface-1">
    <div class="map">
      <div
        v-for="cell in state.map.cells"
        :key="`${cell.position.toString()}`"
        :style="{ '--col': cell.x + 1, '--row': cell.y + 1 }"
        :class="['cell', { 'move-target': state.map.getPathTo(activeEntity, cell) }]"
      />

      <div
        v-for="entity in state.entities"
        :key="entity.id"
        :style="{ '--col': entity.position.x + 1, '--row': entity.position.y + 1 }"
        :class="['entity', { active: entity.id === state.activeEntity.id }]"
      />
    </div>
    <h2>Game view</h2>
    <h3>Active entity</h3>
    <pre>{{ state.activeEntity.id }} {{ state.activeEntity.kind }}</pre>
    <h3>Players</h3>
    <pre>{{ state.players }}</pre>
    <h3>Entities</h3>
    <pre>{{ state.entities }}</pre>
    <h3>Map</h3>
    <pre>{{ state.map.cells }}</pre>
  </div>
</template>

<style>
.map {
  --width: v-bind('state.map.width');
  --height: v-bind('state.map.height');

  display: grid;
  grid-template-columns: repeat(var(--width), 1fr);
  grid-template-rows: repeat(var(--height), 1fr);

  width: calc(3rem * var(--width));
  height: calc(3rem * var(--height));

  border: solid var(--border-size-1) var(--border);

  & > * {
    grid-column: var(--col);
    grid-row: var(--row);
  }
}

.cell {
  border: solid var(--border-size-1) var(--border);

  &.move-target {
    background-color: var(--gray-6);
  }
}

.entity {
  background: var(--blue-7);
  border-radius: var(--radius-round);

  &.active {
    background-color: var(--red-7);
  }
}
</style>
