import {
  type Player,
  type SerializedGameState,
  ServerSession,
  defaultConfig
} from '@game/sdk';
import type { GameServer, GameSocket } from './types';
import type { AnyObject, Defined } from '@game/shared';
import { type FunctionReturnType } from 'convex/server';
import { api } from '@game/api';
import { stringify } from 'zipson';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { SerializedAction } from '@game/sdk/src/action/action';
import type { SerializedPlayer } from '@game/sdk/src/player/player';

type GameInput = Defined<FunctionReturnType<typeof api.games.byRoomId>>;

const defaultFormat = {
  config: defaultConfig,
  cards: {}
};

export class Game {
  readonly session: ServerSession;
  readonly minPlayers = 2;
  private playerJoined = new Set<string>();
  private isStarted = false;
  private turnTimeout?: ReturnType<typeof setTimeout>;
  private turnWarningTimeout?: ReturnType<typeof setTimeout>;
  private startDate!: number;

  constructor(
    private io: GameServer,
    private convexClient: ConvexHttpClient,
    private game: GameInput,
    public roomId: string
  ) {
    this.session = ServerSession.create(this.getInitialState(), {
      seed: this.game.seed,
      format: this.game.format
    });
    this.session.on('game:error', this.onGameError.bind(this));
    this.session.onUpdate(this.onGameAction.bind(this));
    this.session.on('game:ended', this.onGameEnded.bind(this));
  }

  private onGameAction(action: SerializedAction, ctx: { rngValues: number[] }) {
    this.io.in(this.game._id).emit('game:action', { action, ctx });
  }

  private onGameError(err: Error) {
    console.log(err);
    this.io.in(this.game._id).emit('error', err.message);
    this.convexClient.action(api.games.cancel, { roomId: this.roomId });
  }

  private async onGameEnded(winnerId: string) {
    try {
      await Promise.all([
        this.convexClient.action(api.games.end, {
          gameId: this.game._id,
          winnerId: winnerId as Id<'users'>,
          replay: stringify(this.session.actionSystem.serialize())
        }),
        this.convexClient.mutation(api.analytics.processGame, {
          gameId: this.game._id,
          events: [
            {
              type: 'game_ended',
              payload: {
                winnerId: winnerId as Id<'users'>,
                duration: Date.now() - this.startDate,
                players: this.game.players.map(player => ({
                  id: player.id,
                  loadout: player.deck.map(card => card.blueprintId)
                }))
              }
            }
          ]
        })
      ]);
    } catch (err) {
      console.log(err);
    }
  }

  private onPlayerInput(
    socket: GameSocket,
    { type, payload }: { type: any; payload: any }
  ) {
    this.session.dispatch({
      type,
      payload: { ...payload, playerId: socket.data.user._id }
    });
  }

  private onTurnStart(player: Player) {
    if (this.turnTimeout) clearTimeout(this.turnTimeout);
    if (this.turnWarningTimeout) clearTimeout(this.turnWarningTimeout);

    this.turnWarningTimeout = setTimeout(
      () => {
        this.io.in(this.game._id).emit('time-remaining', 20000);
      },
      (Number(process.env.TURN_LIMIT_IN_SECONDS) - 20) * 1000
    );

    this.turnTimeout = setTimeout(
      () => {
        this.session.dispatch({
          type: 'endTurn',
          payload: {
            playerId: player.id
          }
        });
      },
      Number(process.env.TURN_LIMIT_IN_SECONDS) * 1000
    );
  }

  private getInitialState(): SerializedGameState {
    return {
      history: [],
      entities: [],
      players: this.game.players.map(p => ({
        id: p.id,
        isPlayer1: p.isPlayer1,
        name: p.name,
        deck: p.deck,
        graveyard: []
      })) as unknown as [SerializedPlayer, SerializedPlayer],
      rng: {
        values: []
      }
    };
  }

  private start(sessionId: string) {
    if (this.isStarted) return;
    this.isStarted = true;
    this.startDate = Date.now();
    if (this.game.status === 'WAITING_FOR_PLAYERS') {
      this.convexClient.mutation(api.games.start, { gameId: this.game._id, sessionId });
    }

    this.session.on('player:turn_start', this.onTurnStart.bind(this));
    this.onTurnStart(this.session.playerSystem.activePlayer);
  }

  join(socket: GameSocket) {
    socket.join(this.game._id);
    socket.emit('game:init', this.session.serialize());

    socket.on('game:action', (arg: { type: any; payload: any }) => {
      this.onPlayerInput(socket, arg);
    });
    socket.on('p1:emote', (emote: string) => {
      this.io.in(this.game._id).emit('p1:emote', emote);
    });
    socket.on('p2:emote', (emote: string) => {
      this.io.in(this.game._id).emit('p2:emote', emote);
    });
    socket.on('game:simulation', async (event: { type: string; payload: AnyObject }) => {
      try {
        const result = await this.session.simulateAction({
          type: event.type,
          payload: {
            ...event.payload,
            playerId: this.session.playerSystem.activePlayer.id
          }
        });
        socket.emit('game:simulation-result', result);
      } catch (err) {
        console.log(err);
      }
    });

    this.playerJoined.add(socket.data.user._id);

    if (this.playerJoined.size === this.minPlayers) {
      this.start(socket.data.sessionId);
    }
  }

  spectate(socket: GameSocket) {
    socket.join(this.game._id);
    socket.emit('game:init', this.session.serialize());
  }

  async shutdown() {
    try {
      await this.convexClient.action(api.games.cancel, { roomId: this.roomId });
    } catch (err) {
      console.error(`Could not cancel game of roomID ${this.roomId}`);
    }
  }
}
