<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import {
  ClientSession,
  GameSession,
  ServerSession,
  type SerializedGameState
} from '@game/sdk';
import { nanoid } from 'nanoid';

const { player1Loadout, player2Loadout, seed } = defineProps<{
  player1Loadout: LoadoutDto;
  player2Loadout: LoadoutDto;
  seed?: string;
}>();

const state: SerializedGameState = {
  history: [],
  entities: [],
  map: testMap,
  rng: {
    values: []
  },
  players: [
    {
      id: '1',
      name: 'Player 1',
      deck: player1Loadout.cards.map(({ id, pedestalId }) => ({
        pedestalId,
        blueprintId: id
      })),
      isPlayer1: true,
      graveyard: []
    },
    {
      id: '2',
      name: 'Player 2',
      deck: player2Loadout.cards.map(({ id, pedestalId }) => ({
        pedestalId,
        blueprintId: id
      })),
      isPlayer1: false,
      graveyard: []
    }
  ]
};

const fx = useFXProvider();

const serverSession = ServerSession.create(state, seed ?? nanoid());
const clientSession = ClientSession.create(serverSession.serialize(), fx.ctx);
serverSession.onUpdate((action, opts) => {
  clientSession.dispatch(action, opts);
});
const dispatch = (
  type: Parameters<(typeof serverSession)['dispatch']>[0]['type'],
  payload: any
) => {
  serverSession.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? serverSession.playerSystem.activePlayer.id
    }
  });
};

const { addP1, addP2, p1Emote, p2Emote } = useEmoteQueue();
</script>

<template>
  <div class="relative">
    <GameRoot
      :p1-emote="p1Emote"
      :p2-emote="p2Emote"
      :game-session="clientSession"
      :player-id="null"
      :game-type="GAME_TYPES.SANDBOX"
      @move="dispatch('move', $event)"
      @attack="dispatch('attack', $event)"
      @end-turn="dispatch('endTurn', $event)"
      @use-skill="dispatch('useSkill', $event)"
      @play-card="dispatch('playCard', $event)"
      @p1-emote="addP1($event)"
      @p2-emote="addP2($event)"
      @draw="dispatch('draw', $event)"
      @add-rune="dispatch('addRune', $event)"
      @get-gold="dispatch('getGold', $event)"
    />

    <SandboxTools :server-session="serverSession" :client-session="clientSession" />
  </div>
</template>
