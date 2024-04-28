<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const state: SerializedGameState = {
  activeEntityId: null,
  history: [],

  map: testMap,
  entities: [],
  players: [
    {
      id: '1',
      name: 'Player 1',
      cards: [
        { blueprintId: 'f1_general', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_djinn', pedestalId: 'pedestal-stone' },
        { blueprintId: 'f1_dancer', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_placeholder', pedestalId: 'pedestal-stone' },
        { blueprintId: 'neutral_tank', pedestalId: 'pedestal-stone' },
        { blueprintId: 'f1_kirin', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_ranged', pedestalId: 'pedestal-stone' }
      ],
      isPlayer1: true,
      graveyard: []
    },
    {
      id: '2',
      name: 'Player 2',
      cards: [
        { blueprintId: 'f1_general', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_djinn', pedestalId: 'pedestal-stone' },
        { blueprintId: 'f1_dancer', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_placeholder', pedestalId: 'pedestal-stone' },
        { blueprintId: 'neutral_tank', pedestalId: 'pedestal-stone' },
        { blueprintId: 'f1_kirin', pedestalId: 'pedestal-grass' },
        { blueprintId: 'f1_ranged', pedestalId: 'pedestal-stone' }
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
