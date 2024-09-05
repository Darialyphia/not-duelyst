<script setup lang="ts">
import { api } from '@game/api';
import 'vue3-carousel/dist/carousel.css';
definePageMeta({
  name: 'SelectGameMode',
  pageTransition: {
    name: 'select-mode',
    mode: 'out-in'
  }
});

const { data: featureFlags, isLoading } = useConvexQuery(api.featureFlags.all, {});

const modes = [
  {
    link: { name: 'Tutorial' },
    name: 'Tutorial',
    description: 'Learn how to play the game.',
    enabled: featureFlags.value?.tutorial
  },
  {
    link: { name: 'Sandbox' },
    name: 'Sandbox',
    description: 'Play a practice game where you control both players.',
    enabled: true
  },
  {
    link: { name: 'Lobbies' },
    name: 'Casual',
    description: 'Play against another player in a friendly game.',
    enabled: featureFlags.value?.lobbies
  },
  {
    link: { name: 'Ranked' },
    name: 'Ranked',
    description: 'Play competitively against another player and climb up the ladder.',
    enabled: featureFlags.value?.matchmaking
  },
  {
    link: { name: 'Tournaments' },
    name: 'Tournaments',
    description: 'Participate and organize tournaments.',
    enabled: featureFlags.value?.tournament
  }
];
</script>

<template>
  <div class="page container">
    <header>
      <BackButton class="inline-flex" />
      <h1 class="text-5">Select game mode</h1>
    </header>

    <div v-if="isLoading">Loading Game modes...</div>
    <!-- <div v-else-if="isMobile" class="flex-1">
      <Carousel :items-to-show="2.5" wrap-around snap-align="start">
        <Slide v-for="mode in modes" :key="mode.name">
          <InteractableSounds>
            <div class="mode" :class="!mode.enabled && 'disabled'">
              <NuxtLink :to="mode.enabled ? mode.link : undefined" class="fancy-surface">
                <div>
                  <h2>{{ mode.name }}</h2>
                  <p>{{ mode.description }}</p>
                </div>
              </NuxtLink>
            </div>
          </InteractableSounds>
        </Slide>
      </Carousel>
    </div> -->

    <template v-else>
      <LinkSounds v-for="mode in modes" :key="mode.name">
        <div class="mode" :class="!mode.enabled && 'disabled'">
          <NuxtLink :to="mode.enabled ? mode.link : undefined" class="fancy-surface">
            <div>
              <h2>{{ mode.name }}</h2>
              <p>{{ mode.description }}</p>
            </div>
          </NuxtLink>
        </div>
      </LinkSounds>
    </template>
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
  gap: var(--size-4) var(--size-8);
  align-items: flex-start;

  padding-top: var(--size-2);
  padding-inline: var(--size-5);

  @screen lg {
    padding-top: var(--size-10);
  }

  > header {
    width: 100%;
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

.mode {
  width: 30ch;
  height: var(--size-14);
  transition: all 0.5s;

  @screen lt-lg {
    height: var(--size-13);
  }

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
      text-transform: uppercase;

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
