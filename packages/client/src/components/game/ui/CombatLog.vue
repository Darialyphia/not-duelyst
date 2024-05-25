<script setup lang="ts">
const { session } = useGame();
const events = ref<any[]>([]);

session.on('card:after_played', event => {
  events.value.unshift({
    type: 'card',
    spriteId: event.blueprint.spriteId,
    generalSpriteId: event.player.general.card.blueprint.spriteId
  });
});

session.on('entity:after_use_skill', event => {
  events.value.unshift({
    type: 'skill',
    entitySpriteId: event.entity.card.blueprint.spriteId,
    skillSpriteId: event.skill.blueprint.iconId
  });
});

session.on('entity:after_attack', event => {
  events.value.unshift({
    type: 'attack',
    attackerSpriteId: event.entity.card.blueprint.spriteId,
    defenderSpriteId: event.target.card.blueprint.spriteId
  });
});

const isCollapsed = ref(true);
</script>

<template>
  <div
    class="combat-log combat-log fancy-surface fancy-scrollbar"
    :class="isCollapsed && 'is-collapsed'"
  >
    <ul v-if="!isCollapsed" v-auto-animate>
      <li v-for="(event, index) in events" :key="index">
        <div v-if="event.type === 'card'">
          <AnimatedCardIcon :sprite-id="event.generalSpriteId" />
          <Icon name="material-symbols-light:playing-cards" size="2em" />
          <AnimatedCardIcon :sprite-id="event.spriteId" />
        </div>

        <div v-else-if="event.type === 'skill'">
          <AnimatedCardIcon :sprite-id="event.entitySpriteId" />
          <Icon name="game-icons:fire" size="2em" />
          <img :src="`/assets/icons/${event.skillSpriteId}.png`" />
        </div>

        <div v-else-if="event.type === 'attack'">
          <AnimatedCardIcon :sprite-id="event.attackerSpriteId" />
          <Icon name="game-icons:crossed-swords" size="2em" />
          <AnimatedCardIcon :sprite-id="event.defenderSpriteId" />
        </div>
      </li>
    </ul>
    <button class="flex flex-col items-center gap-2" @click="isCollapsed = !isCollapsed">
      <Icon :name="isCollapsed ? 'material-symbols:arrow-forward-ios' : 'mdi:close'" />
      <span v-if="isCollapsed" class="text-00">Combat Log</span>
    </button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: absolute;
  top: 33%;

  overflow-y: auto;
  display: flex;

  line-height: 2;

  &.is-collapsed {
    padding: var(--size-2);
  }
  &:not(.is-collapsed) {
    min-width: var(--size-13);
    height: var(--size-15);
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
</style>
