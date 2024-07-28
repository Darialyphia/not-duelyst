<script setup lang="ts">
const { session } = useGame();
const events = ref<string[]>([]);

session.on('card:after_played', event => {
  events.value.unshift(`${event.player.name} played ${event.blueprint.name}`);
});
session.on('entity:after_attack', event => {
  // events.value.unshift({
  //   type: 'attack',
  //   attackerSpriteId: event.entity.card.blueprint.spriteId,
  //   defenderSpriteId: event.target.card.blueprint.spriteId
  // });
});

const isCollapsed = ref(true);
</script>

<template>
  <div
    class="combat-log combat-log fancy-surface fancy-scrollbar"
    :class="isCollapsed && 'is-collapsed'"
  >
    <ul v-if="!isCollapsed" v-auto-animate>
      <li v-for="(event, index) in events" :key="index">{{ event }}</li>
    </ul>
    <button class="fancy-surface toggle" @click="isCollapsed = !isCollapsed">
      <Icon name="material-symbols:arrow-forward-ios" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: absolute;
  top: 33%;

  /* overflow-y: auto; */
  display: flex;

  width: var(--size-13);
  height: var(--size-15);

  line-height: 2;

  transition: transform 0.2s var(--ease-1);

  &.is-collapsed {
    transform: translateX(-100%);
    padding: var(--size-2);
  }

  > button {
    align-self: start;
    margin-inline-start: auto;
  }
}

li {
  margin-block: var(--size-3);
}
li > div {
  display: grid;
  grid-template-columns: repeat(3, 64px);
  gap: var(--size-3);
  justify-items: center;
  > * {
    aspect-ratio: 1;
    height: 64px;
  }
}

.toggle {
  position: absolute;
  top: 0;
  left: 100%;
  transform: translateY(-2px);

  width: var(--size-7);
  height: var(--size-10);
  padding: 0;

  background-color: red;
  border-left: none;
  > svg {
    aspect-ratio: 1;
    width: 100%;
  }
}
</style>
