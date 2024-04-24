<script setup lang="ts">
const { session } = useGame();
const events = ref<any[]>([]);
const root = ref<HTMLElement>();
session.on('*', event => {
  events.value.push(event);
  nextTick(() => {
    if (isCollpased.value) return;
    [...root.value!.children].at(-1)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const isCollpased = ref(true);
</script>

<template>
  <div
    class="combat-log combat-log fancy-surface fancy-scrollbar"
    :class="isCollpased && 'is-collapsed'"
  >
    <ul v-if="!isCollpased" ref="root" v-auto-animate>
      <li v-for="(event, index) in events" :key="index">{{ event }}</li>
    </ul>
    <button @click="isCollpased = !isCollpased">X</button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: absolute;
  top: 33%;

  overflow-y: auto;
  display: flex;

  line-height: 2;

  &:not(.is-collapsed) {
    width: var(--size-13);
    height: 35%;
  }

  > button {
    align-self: start;
    margin-inline-start: auto;
  }
}
</style>
