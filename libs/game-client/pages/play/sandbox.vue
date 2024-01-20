<script setup lang="ts">
import { api } from '@hc/api';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { GameMapDto } from '@hc/api/convex/gameMap/gameMap.mapper';
import { UNITS, type SerializedGameState } from '@hc/sdk';
import type { Nullable } from '@hc/shared';
import { parse } from 'zipson';

definePageMeta({
  name: 'Sandbox'
});

const { data: maps, isLoading: isMapsLoading } = useConvexQuery(
  api.gameMaps.getAll,
  {},
  { ssr: false }
);
const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {},
  { ssr: false }
);

const isLoading = computed(() => isMapsLoading.value || isLoadoutsLoading.value);

const form = reactive<{
  map: Nullable<GameMapDto>;
  player1Loadout: Nullable<LoadoutDto>;
  player2Loadout: Nullable<LoadoutDto>;
}>({
  map: null,
  player1Loadout: null,
  player2Loadout: null
});

const getGeneralImage = (generalId: string) => {
  const unit = UNITS[generalId];
  return `/assets/units/${unit.spriteId}-icon.png`;
};

const isReady = ref(false);
const createGameState = (): Promise<SerializedGameState> => {
  return Promise.resolve({
    activePlayerId: 'Player1',
    history: [],
    entities: [],
    turn: 0,
    players: [
      {
        gold: 2,
        id: 'Player1',
        name: 'Player1',
        loadout: {
          units: Object.fromEntries(
            form.player1Loadout!.unitIds.map(unit => [unit, { cooldown: 0 }])
          )
        },
        generalId: form.player1Loadout!.generalId
      },
      {
        gold: 2,
        id: 'Player2',
        name: 'Player2',
        loadout: {
          units: Object.fromEntries(
            form.player2Loadout!.unitIds.map(unit => [unit, { cooldown: 0 }])
          )
        },
        generalId: form.player2Loadout!.generalId
      }
    ],
    map: {
      ...form.map!,
      cells: parse(form.map!.cells),
      startPositions: [form.map!.startPositions[0], form.map!.startPositions[1]]
    }
  });
};
</script>

<template>
  <div class="overflow-hidden">
    <section v-if="!isReady" class="container fancy-surface mt-10">
      <header>
        <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
        <h1 class="text-5">Create sandbox game</h1>
      </header>

      <div v-if="isLoading">Loading...</div>
      <form v-else @submit.prevent="isReady = true">
        <fieldset>
          <legend>Map</legend>

          <label v-for="map in maps" :key="map.id">
            <input v-model="form.map" type="radio" :value="map" />
            {{ map.name }}
          </label>
        </fieldset>
        <div class="grid grid-cols-2 gap-2">
          <fieldset>
            <legend>Player 1 loadout</legend>
            <div>
              <label v-for="loadout in loadouts" :key="loadout._id">
                <LoadoutCard :loadout="loadout" />
                <input
                  v-model="form.player1Loadout"
                  type="radio"
                  :value="loadout._id"
                  class="sr-only"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Player 2 loadout</legend>
            <div>
              <label v-for="loadout in loadouts" :key="loadout._id">
                <LoadoutCard :loadout="loadout" />
                <input
                  v-model="form.player2Loadout"
                  type="radio"
                  :value="loadout._id"
                  class="sr-only"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <UiButton
          class="primary-button"
          :disabled="!form.map || !form.player1Loadout || !form.player2Loadout"
        >
          Start
        </UiButton>
      </form>
    </section>

    <ClientOnly v-else>
      <SandboxGame :initial-state-factory="createGameState" />
      <template #fallback>
        <div />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped lang="postcss">
header {
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}

fieldset {
  padding: var(--size-4);
  border: var(--fancy-border);
  > div {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);

    label:has(input:checked) {
      filter: brightness(125%);
      outline: solid var(--border-size-2) var(--primary);
      outline-offset: var(--size-1);
    }
  }

  > legend {
    font-size: -fs3;
    color: var(--primary);
  }
}

form > button {
  --d-button-size: var(--font-size-4);

  width: var(--size-12);
  margin-block-start: var(--size-4);
  margin-inline: auto;
}
</style>
