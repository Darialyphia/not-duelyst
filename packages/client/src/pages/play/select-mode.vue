<script setup lang="ts">
definePageMeta({
  name: 'SelectGameMode',
  pageTransition: {
    name: 'select-mode',
    mode: 'out-in'
  }
});
</script>

<template>
  <div class="page container pt-2 px-5 lg:pt-10">
    <header>
      <BackButton class="inline-flex" />
      <h1 class="text-5">Select game mode</h1>
    </header>

    <InteractableSounds>
      <div class="mode">
        <NuxtLink :to="{ name: 'Tutorial' }">
          <div class="fancy-surface">
            <h2>Tutorial</h2>
            <p>Learn how to play the game.</p>
          </div>
        </NuxtLink>
      </div>
    </InteractableSounds>

    <InteractableSounds>
      <div class="mode">
        <NuxtLink :to="{ name: 'Matchmaking' }">
          <div class="fancy-surface">
            <h2>Ranked</h2>
            <p>Play against another player.</p>
          </div>
        </NuxtLink>
      </div>
    </InteractableSounds>

    <InteractableSounds>
      <div class="mode">
        <NuxtLink :to="{ name: 'Sandbox' }" @click.prevent>
          <div class="fancy-surface">
            <h2>Sandbox</h2>

            <p>Play a practice game where you control both players.</p>
          </div>
        </NuxtLink>
      </div>
    </InteractableSounds>
  </div>
</template>

<style lang="postcss">
.select-mode-enter-active,
.select-mode-leave-active {
  transition: all 0.4s;
}

.select-mode-enter-from,
.select-mode-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style scoped lang="postcss">
.page {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;

  > header {
    width: 100%;
    margin-bottom: var(--size-6);
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

.mode {
  width: 30ch;
  height: var(--size-14);
  > a {
    display: grid;
    height: 100%;
    font-size: var(--font-size-4);
    text-align: center;
    &:hover {
      filter: brightness(130%);
    }

    > div {
      display: grid;
      place-content: center;
    }
  }
}
</style>
