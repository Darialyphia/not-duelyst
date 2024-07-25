<script setup lang="ts">
import { api } from '@game/api';

defineOptions({
  inheritAttrs: false
});
const isSettingsOpened = ref(false);

const { mutate: signOff } = useConvexAuthedMutation(api.auth.signOff);
</script>

<template>
  <nav v-bind="$attrs">
    <ul class="grid gap-2">
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <NuxtLink :to="{ name: 'SelectGameMode' }">Play</NuxtLink>
          </Sound>
        </Sound>
      </li>
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink>
          </Sound>
        </Sound>
      </li>
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <NuxtLink :to="{ name: 'FormatList' }">Formats</NuxtLink>
          </Sound>
        </Sound>
      </li>
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <NuxtLink :to="{ name: 'WatchList' }">Watch</NuxtLink>
          </Sound>
        </Sound>
      </li>
      <li></li>
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <button @click="isSettingsOpened = true">Settings</button>
          </Sound>
        </Sound>
      </li>
      <li>
        <Sound sound="button-hover" :triggers="['mouseenter']">
          <Sound sound="button-click" :triggers="['mousedown']">
            <button @click="signOff({})">Sign Off</button>
          </Sound>
        </Sound>
      </li>
    </ul>
  </nav>

  <UiModal
    v-model:is-opened="isSettingsOpened"
    title="Settings"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <SettingsForm @close="isSettingsOpened = false" />
  </UiModal>
</template>

<style scoped lang="postcss">
@keyframes main-navigation-item {
  from {
    transform: translatey(calc(-1 * var(--size-6)));
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

ul {
  width: fit-content;
}
li {
  opacity: 0;
  animation: main-navigation-item 0.5s ease-out forwards;
  animation-delay: calc((var(--child-index) * 30ms));

  > * {
    position: relative;

    display: block;

    padding: 0;

    font-size: var(--font-size-4);
    text-align: left;
    text-shadow: black 0px 4px 1px;
    &::after {
      content: '';

      position: absolute;
      bottom: -5px;
      left: 50%;

      width: 0;
      height: 3px;

      background-color: var(--primary);

      transition:
        width 0.2s,
        left 0.2s;
    }

    &:hover::after {
      left: 0;
      width: 100%;
    }
  }
}
</style>
