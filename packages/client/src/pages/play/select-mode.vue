<script setup lang="ts">
import { api } from '@game/api';
import { FEATURE_FLAGS } from '@game/api/src/convex/featureFlags/featureFlags.constants';

definePageMeta({
  name: 'SelectGameMode',
  pageTransition: {
    name: 'select-mode',
    mode: 'out-in'
  }
});

const { data: featureFlags } = useConvexQuery(api.featureFlags.all, {});
</script>

<template>
  <div class="page container pt-2 px-5 lg:pt-10">
    <header>
      <BackButton class="inline-flex" />
      <h1 class="text-5">Select game mode</h1>
    </header>

    <InteractableSounds>
      <div class="mode" :class="!featureFlags.tutorial && 'disabled'">
        <NuxtLink
          :to="featureFlags.tutorial ? { name: 'Tutorial' } : undefined"
          class="fancy-surface"
        >
          <div>
            <h2>Tutorial</h2>
            <p>Learn how to play the game.</p>
          </div>
        </NuxtLink>
      </div>
    </InteractableSounds>

    <InteractableSounds>
      <div class="mode" :class="!featureFlags.matchmaking && 'disabled'">
        <NuxtLink
          :to="featureFlags.matchmaking ? { name: 'Matchmaking' } : undefined"
          class="fancy-surface"
        >
          <div>
            <h2>Ranked</h2>
            <p>Play against another player.</p>
          </div>
        </NuxtLink>
      </div>
    </InteractableSounds>

    <InteractableSounds>
      <div class="mode">
        <NuxtLink :to="{ name: 'Sandbox' }" class="fancy-surface">
          <div>
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
  transform-style: preserve-3d;

  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);
  align-items: flex-start;
  justify-content: space-between;

  perspective: 600px;
  perspective-origin: 75% center;

  > header {
    width: 100%;
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;

    @screen lg {
      margin-bottom: var(--size-6);
    }
  }
}

.mode {
  width: 30ch;
  height: var(--size-14);
  transition: all 0.5s;

  &.disabled {
    position: relative;

    &::after {
      --f: 0.5em; /* control the folded part */

      content: 'Coming Soon';

      position: absolute;
      top: 0;
      right: 0;
      transform-origin: 0% 100%;
      transform: translate(calc((1 - cos(45deg)) * 100%), -100%) rotate(45deg);

      padding-bottom: var(--f);
      padding-inline: 1lh;

      font-size: var(--font-size-1);
      font-weight: bold;
      line-height: 1.8;
      color: #fff;

      background-color: var(--error);
      clip-path: polygon(
        100% calc(100% - var(--f)),
        100% 100%,
        calc(100% - var(--f)) calc(100% - var(--f)),
        var(--f) calc(100% - var(--f)),
        0 100%,
        0 calc(100% - var(--f)),
        999px calc(100% - var(--f) - 999px),
        calc(100% - 999px) calc(100% - var(--f) - 999px)
      );
      border-image: conic-gradient(#0008 0 0) 51% / var(--f);
    }
    > a {
      background: linear-gradient(135deg, var(--gray-8), var(--gray-10));
    }
  }

  @screen lt-lg {
    flex-basis: 32%;
    width: auto;
    height: var(--size-13);
  }

  &:nth-of-type(2) {
    animation-delay: 0.15s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.3s;
  }

  &:not(.disabled) {
    &:hover {
      transform: translateY(-1rem);
      box-shadow: 0 5px 1rem hsl(var(--color-primary-hsl) / 0.5);
    }
    & > a:hover {
      filter: brightness(130%);
    }
  }
  > a {
    display: grid;
    height: 100%;
    font-size: var(--font-size-4);
    text-align: center;

    > div {
      display: grid;
      place-content: center;
    }
  }
}
</style>
