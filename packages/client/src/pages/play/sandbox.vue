<script setup lang="ts">
import { api } from '@game/api';
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { defaultConfig } from '@game/sdk';
import type { Nullable } from '@game/shared';

definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});

const form = reactive<{
  player1Loadout: Nullable<LoadoutDto>;
  player2Loadout: Nullable<LoadoutDto>;
  format: Nullable<GameFormatDto>;
}>({
  player1Loadout: null,
  player2Loadout: null,
  format: null
});

const isReady = ref(false);

const bgm = useBgm();
until(isReady)
  .toBeTruthy()
  .then(() => {
    bgm.next(BGMS.BATTLE);
  });

const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);

const { data: formats } = useConvexAuthedQuery(api.formats.all, {});
const standardFormat = {
  config: defaultConfig,
  cards: {}
};
</script>

<template>
  <div class="page">
    <SandboxGame
      v-if="isReady"
      :player1-loadout="form.player1Loadout!"
      :player2-loadout="form.player2Loadout!"
      :format="form.format!"
    />
    <section v-else class="container mt-2 px-5 lg:mt-10">
      <header>
        <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
        <h1 class="text-5 mb-6">Create sandbox game</h1>
      </header>

      <div v-if="isLoadoutsLoading">Loading...</div>
      <form v-else class="grid grid-cols-2 gap-2" @submit.prevent="isReady = true">
        <fieldset class="fancy-surface formats">
          <legend>Format</legend>

          <div v-if="formats" class="grid grid-cols-3 gap-4">
            <InteractableSounds>
              <UiTooltip side="right">
                <template #trigger>
                  <label class="format">
                    <div class="font-500">Standard Format (Official)</div>
                    <input
                      v-model="form.format"
                      type="radio"
                      class="sr-only"
                      :value="standardFormat"
                    />
                  </label>
                </template>

                <FormatRules :format="standardFormat" class="fancy-surface" />
              </UiTooltip>
            </InteractableSounds>
            <InteractableSounds v-for="format in formats" :key="format._id">
              <UiTooltip side="right">
                <template #trigger>
                  <label class="format">
                    <div class="font-500">{{ format.name }}</div>
                    <div class="text-0">by {{ format.author.name }}</div>
                    <input
                      v-model="form.format"
                      type="radio"
                      class="sr-only"
                      :value="format"
                    />
                  </label>
                </template>

                <FormatRules :format="format" class="fancy-surface" />
              </UiTooltip>
            </InteractableSounds>
          </div>
        </fieldset>

        <fieldset class="fancy-surface player-loadout">
          <legend>Player 1 loadout</legend>
          <InteractableSounds v-for="loadout in loadouts" :key="loadout._id">
            <label class="cursor-pointer">
              <LoadoutCard :loadout="loadout" />
              <input
                v-model="form.player1Loadout"
                name="playr-1-loadout"
                type="radio"
                :value="loadout"
                class="sr-only"
              />
            </label>
          </InteractableSounds>
        </fieldset>
        <fieldset class="fancy-surface player-loadout">
          <legend>Player 2 loadout</legend>
          <InteractableSounds v-for="loadout in loadouts" :key="loadout._id">
            <label class="cursor-pointer">
              <LoadoutCard :loadout="loadout" />
              <input
                v-model="form.player2Loadout"
                name="playr-2-loadout"
                type="radio"
                :value="loadout"
                class="sr-only"
              />
            </label>
          </InteractableSounds>
        </fieldset>

        <Transition>
          <UiFancyButton
            v-if="form.player1Loadout && form.player2Loadout"
            class="primary-button start-button"
          >
            Start
          </UiFancyButton>
        </Transition>
      </form>
    </section>
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave-active {
  transition: all 0.4s;
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style lang="postcss" scoped>
.page {
  overflow: hidden;
  min-height: 100dvh;
}

header {
  width: 100%;
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}
form {
  padding-block-end: var(--size-5);

  & > fieldset {
    display: grid;
    gap: var(--size-1);
  }

  & > button {
    --ui-button-size: var(--font-size-4);

    width: var(--size-12);
    margin-block-start: var(--size-4);
    margin-inline: auto;
  }

  & > fieldset > legend {
    font-size: var(--font-size-3);
    color: var(--primary);
    text-shadow: 0 -2px 5px black;
  }
  & > fieldset > label {
    display: block;
    padding: var(--size-1) var(--size-2);
    background: linear-gradient(black, transparent), var(--bg);
    background-size: cover;
  }
}

label {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover,
  &:focus-within {
    transform: scale(1.02);
    filter: brightness(120%);
    box-shadow: var(--shadow-3);
  }

  &:has(input:checked) {
    filter: brightness(125%);
    outline: solid var(--border-size-2) var(--border);
    outline-offset: var(--size-1);
  }
}

.start-button {
  grid-column: 1 / -1;
  justify-self: center;
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(var(--size-4));
    opacity: 0;
  }
}

.formats {
  grid-column: 1 / -1;
}

.format {
  padding: var(--size-3);
  border: solid 1px var(--border);
  &:has(input:checked) {
    filter: brightness(125%);
    outline: solid var(--border-size-2) var(--border);
    outline-offset: var(--size-1);
  }
}
</style>
