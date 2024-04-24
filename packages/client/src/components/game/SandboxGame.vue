<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const WIDTH = 13;
const HEIGHT = 7;
const OFFSET = 0;
const state: SerializedGameState = {
  activeEntityId: null,
  history: [],

  map: {
    height: HEIGHT,
    width: WIDTH,
    cells: Array.from({ length: HEIGHT }, (_, y) =>
      Array.from({ length: WIDTH }, (_, x) => ({
        position: {
          x: x + OFFSET,
          y: y + OFFSET,
          z: 0
        },
        spriteId: 'ground',
        tileBlueprintId: null
      }))
    )
      .concat(
        Array.from({ length: HEIGHT }, (_, y) =>
          Array.from({ length: 1 }, (_, x) => ({
            position: {
              x: Math.floor(WIDTH / 2) + x + OFFSET,
              y: y + OFFSET,
              z: 1
            },
            spriteId: 'ground',
            tileBlueprintId: null
          }))
        )
      )
      .concat([
        {
          position: {
            x: Math.floor(WIDTH / 2) + OFFSET,
            y: Math.floor(HEIGHT / 2) + OFFSET,
            z: 2
          },
          spriteId: 'ground',
          tileBlueprintId: null
        }
      ])
      .flat(),
    player1StartPosition: { x: 0 + OFFSET, y: Math.floor(HEIGHT / 2) + OFFSET, z: 0 },
    player2StartPosition: {
      x: WIDTH - 1 + OFFSET,
      y: Math.floor(HEIGHT / 2) + OFFSET,
      z: 0
    }
  },
  entities: [],
  players: [
    {
      id: '1',
      name: 'Player 1',
      cards: [
        { blueprintId: 'f1_general' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' }
      ],
      isPlayer1: true,
      graveyard: []
    },
    {
      id: '2',
      name: 'Player 2',
      cards: [
        { blueprintId: 'f1_general' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' },
        { blueprintId: 'f1_placeholder' }
      ],
      isPlayer1: false,
      graveyard: []
    }
  ]
};

const fx = useFXProvider();
const session = GameSession.createClientSession(state, 'seed', fx.ctx);

const dispatch = (
  type: Parameters<(typeof session)['dispatch']>[0]['type'],
  payload: any
) => {
  session.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? session.playerSystem.activePlayer.id
    }
  });
};
</script>

<template>
  <Game
    :game-session="session"
    :player-id="null"
    :game-type="GAME_TYPES.SANDBOX"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @play-card="dispatch('playCard', $event)"
  />
</template>
