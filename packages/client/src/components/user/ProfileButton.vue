<script setup lang="ts">
import { api } from '@game/api';

defineOptions({
  inheritAttrs: false
});
const { data: me } = useConvexAuthedQuery(api.users.me, {});
</script>

<template>
  <Sound v-if="me" sound="button-hover" :triggers="['mouseenter']">
    <Sound sound="button-click" :triggers="['mousedown']">
      <NuxtLink
        v-slot="{ navigate, href }"
        :to="{ name: 'Profile', params: { name: me.fullName } }"
        custom
      >
        <button class="profile-button" :href v-bind="$attrs" @click="navigate">
          <img src="/assets/portraits/f1-general.png" />
          {{ me.fullName }}
        </button>
      </NuxtLink>
    </Sound>
  </Sound>
</template>

<style scoped lang="postcss">
.profile-button {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-2) var(--size-4);

  font-size: var(--font-size-3);
  line-height: 1;
  text-shadow: black 0px 3px 1px;

  border-radius: var(--radius-3);

  transition: background-color 0.3s;
  > img {
    transition: filter 0.3s;
  }
  &:hover,
  &:focus-visible {
    background-color: hsl(0 0 0 / 0.2);
    > img {
      filter: drop-shadow(6px 6px 5px var(--cyan-5))
        drop-shadow(-6px -6px 5px var(--orange-5));
    }
  }
}
</style>
