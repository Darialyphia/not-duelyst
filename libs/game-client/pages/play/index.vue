<script setup lang="ts">
import { SignOutButton } from 'vue-clerk';
import bg from '../../assets/backgrounds/palace.jpg';
definePageMeta({
  name: 'ClientHome'
});
</script>
<template>
  <div class="page" :style="{ '--bg': `url(${bg})` }">
    <div>
      <nav>
        <ul class="grid gap-2">
          <li><NuxtLink :to="{ name: 'Matchmaking' }">Play</NuxtLink></li>
          <li><NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink></li>
          <li><NuxtLink :to="{ name: 'WatchList' }">Watch</NuxtLink></li>
          <li><NuxtLink :to="{ name: 'MyProfile' }">Profile</NuxtLink></li>
          <li><SignOutButton @sign-out="navigateTo('/login')" /></li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.page {
  min-height: 100vh;
  background: var(--bg);
  background-attachment: fixed;
  background-size: cover;

  > div {
    display: grid;
    place-content: center;

    height: 100%;
    min-height: 100vh;

    background: var(--fancy-bg-transparency);
  }
}

li > * {
  position: relative;

  display: block;

  padding: 0;

  font-size: var(--font-size-5);
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
</style>
