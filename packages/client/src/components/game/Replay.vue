<script setup lang="ts">
import type { GameDto } from '@game/api/src/convex/game/game.mapper';
import type { GameMapDto } from '@game/api/src/convex/gameMap/gameMap.mapper';
import { config, GameSession, type SerializedGameState } from '@game/sdk';
import { parse } from 'zipson';

const { game, replay, map } = defineProps<{
  game: GameDto;
  replay: string;
  map: GameMapDto;
}>();
const emit = defineEmits<{}>();

const parsedReplay = parse(replay);

const players = game.players.slice().sort(a => (a._id === game.firstPlayer ? -1 : 1));
const initialState: SerializedGameState = {
  history: [],
  entities: [],
  players: [
    {
      id: players[0]._id,
      isPlayer1: true,
      name: players[0].name,
      currentGold: config.PLAYER_1_STARTING_GOLD,
      maxGold: config.PLAYER_1_STARTING_GOLD,
      cards: players[0].loadout!.cards.map(({ id, pedestalId }) => ({
        pedestalId,
        blueprintId: id
      })),
      graveyard: []
    },
    {
      id: players[1]._id,
      isPlayer1: false,
      name: players[1].name,
      currentGold: config.PLAYER_1_STARTING_GOLD,
      maxGold: config.PLAYER_1_STARTING_GOLD,
      cards: players[1].loadout!.cards.map(({ id, pedestalId }) => ({
        pedestalId,
        blueprintId: id
      })),
      graveyard: []
    }
  ],
  map: {
    width: map.width,
    height: map.height,
    player1StartPosition: map.startPositions[0],
    player2StartPosition: map.startPositions[1],
    cells: parse(map.cells)
  }
};

const fx = useFXProvider();
const session = GameSession.createClientSession(initialState, game.seed, fx.ctx);

const currentStep = ref(0);
const isPlaying = ref(false);

const next = () => {
  if (!parsedReplay) return;
  if (currentStep.value === parsedReplay.length) {
    isPlaying.value = false;
    return;
  }
  session.dispatch(parsedReplay[currentStep.value]);
  currentStep.value++;
};

session.on('game:action', () => {
  if (isPlaying.value) {
    setTimeout(() => {
      next();
    }, 1000);
  }
});
</script>

<template>
  <div class="relative">
    <GameRoot
      :p1-emote="null"
      :p2-emote="null"
      :game-session="session"
      :player-id="null"
      :game-type="GAME_TYPES.SANDBOX"
    />
    <div
      class="controls"
      :style="{
        '--ui-button-radius': 'var(--radius-round)'
      }"
    >
      <UiButton
        class="primary-button"
        @click="
          () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
              next();
            }
          }
        "
      >
        <Icon
          size="2em"
          :name="
            isPlaying ? 'material-symbols:pause' : 'material-symbols-light:play-arrow'
          "
        />
      </UiButton>
      <UiButton class="primary-button" :disabled="isPlaying" @click="next">
        <Icon name="material-symbols:fast-forward" size="2em" />
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.controls {
  position: absolute;
  right: calc(var(--size-11) - var(--size-7));
  bottom: var(--size-4);

  display: flex;
  gap: var(--size-3);
}
button {
  height: 58px;
}
</style>
