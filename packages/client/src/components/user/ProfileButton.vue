<script setup lang="ts">
import { api } from '@game/api';

defineOptions({
  inheritAttrs: false
});
const { data: me } = useConvexAuthedQuery(api.users.me, {});
</script>

<template>
  <NuxtLink
    v-if="me"
    v-slot="{ navigate, href }"
    :to="me.slug ? { name: 'Profile', params: { slug: me.slug ?? '' } } : undefined"
    custom
  >
    <LinkSounds>
      <button class="profile-button" :href v-bind="$attrs" @click="navigate">
        <img :src="me.avatar" width="64" />
        {{ me.fullName }}
      </button>
    </LinkSounds>
  </NuxtLink>
</template>

<style scoped lang="postcss">
.profile-button {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  padding: var(--size-3);

  font-size: var(--font-size-3);
  line-height: 1;
  text-shadow: black 0px 3px 1px;

  border-radius: var(--radius-3);

  transition: background-color 0.3s;

  > img {
    overflow: hidden;

    filter: drop-shadow(0 3px 8px hsl(0 0 0 / 0.7));
    border: var(--fancy-border);
    border-radius: var(--radius-round);

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
