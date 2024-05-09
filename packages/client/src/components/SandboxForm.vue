<script setup lang="ts">
import { api } from '@game/api';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import type { Nullable } from '@game/shared';

const emit = defineEmits<{
  submit: [{ player1Loadout: LoadoutDto; player2Loadout: LoadoutDto }];
}>();
const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);

const form = reactive<{
  player1Loadout: Nullable<LoadoutDto>;
  player2Loadout: Nullable<LoadoutDto>;
}>({
  player1Loadout: null,
  player2Loadout: null
});

const assets = useAssetsProvider();
assets.load();
</script>

<template>
  <section class="container mt-10" v-if="assets.loaded.value">
    <header>
      <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
      <h1 class="text-5">Create sandbox game</h1>
    </header>

    <div v-if="isLoadoutsLoading">Loading...</div>
    <form
      v-else
      @submit.prevent="
        emit('submit', {
          player1Loadout: form.player1Loadout!,
          player2Loadout: form.player2Loadout!
        })
      "
    >
      <div class="grid grid-cols-2 gap-2">
        <fieldset class="fancy-surface player-loadout">
          <legend>Player 1 loadout</legend>
          <div>
            <label v-for="loadout in loadouts" :key="loadout._id" class="cursor-pointer">
              <LoadoutCard :loadout="loadout" />
              <input
                v-model="form.player1Loadout"
                name="playr-1-loadout"
                type="radio"
                :value="loadout"
                class="sr-only"
              />
            </label>
          </div>
        </fieldset>
        <fieldset class="fancy-surface player-loadout">
          <legend>Player 2 loadout</legend>
          <div>
            <label v-for="loadout in loadouts" :key="loadout._id" class="cursor-pointer">
              <LoadoutCard :loadout="loadout" />
              <input
                v-model="form.player2Loadout"
                name="playr-2-loadout"
                type="radio"
                :value="loadout"
                class="sr-only"
              />
            </label>
          </div>
        </fieldset>
      </div>

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
</template>

<style lang="postcss">
fieldset {
  padding: var(--size-4);
  border: var(--fancy-border);
  > div {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
  }

  > legend {
    font-size: var(--font-size-3);
    color: var(--primary);
  }
}

form {
  padding-block-end: var(--size-5);

  & > fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-3);
  }

  & > button {
    --ui-button-size: var(--font-size-4);

    width: var(--size-12);
    margin-block-start: var(--size-4);
    margin-inline: auto;
  }

  & > fieldset > label {
    display: block;

    width: var(--size-12);
    height: var(--size-11);
    padding: var(--size-1) var(--size-2);

    background: linear-gradient(black, transparent), var(--bg);
    background-size: cover;
    border: var(--fancy-border);
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
    outline: solid var(--border-size-2) var(--primary);
    outline-offset: var(--size-1);
  }
}

.start-button {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(var(--size-4));
    opacity: 0;
  }
}
</style>
