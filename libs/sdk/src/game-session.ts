import mitt from 'mitt';
import { InputReducer, SerializedInput } from './input/input-reducer';
import { Entity, SerializedEntity, EntityEvent } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { ActionHistory } from './action/action-history';
import { GameMap, GameMapOptions } from './map/map';
import { Player, PlayerId } from './player/player';
import { PlayerManager, SerializedPlayer } from './player/player-manager';
import { SerializedAction } from './action/action-deserializer';
import { ActionQueue } from './action/action-queue';
import { FXContext, GameAction } from './action/action';

export type GameState = {
  map: Pick<GameMap, 'height' | 'width' | 'cells'>;
  entities: Entity[];
  players: Player[];
  activePlayer: Player;
  winner?: Player;
  turn: number;
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  activePlayerId: PlayerId;
  turn: number;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in EntityEvent | EntityLifecycleEvent as `entity:${Event}`]: Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'game:action': GameAction<any>;
  'game:turn-end': Player;
  'game:turn-start': Player;
};

export class GameSession {
  static createServerSession(state: SerializedGameState) {
    return new GameSession(state, true);
  }

  static createClientSession(state: SerializedGameState) {
    return new GameSession(state, false);
  }

  map = new GameMap(this);

  playerManager = new PlayerManager(this);

  entityManager = new EntityManager(this);

  history = new ActionHistory(this);

  actionQueue = new ActionQueue(this);

  inputReducer = new InputReducer(this);

  emitter = mitt<GlobalGameEvents>();

  nextEventId = 1;

  fxContext?: FXContext;

  winner?: PlayerId;

  turn: number;

  private constructor(
    state: SerializedGameState,
    readonly isAuthoritative: boolean
  ) {
    this.turn = state.turn;
    this.map.setup(state.map);
    this.playerManager.setup(state.activePlayerId, state.players);
    this.entityManager.setup(state.entities);
    this.history.setup(state.history);

    if (!this.entityManager.getList().length) {
      this.playerManager.getList().forEach((player, index) => {
        this.entityManager.addEntity({
          playerId: player.id,
          unitId: player.generalId,
          position: state.map.startPositions[index]
        });
      });
    }
  }

  getState(): Readonly<GameState> {
    return {
      map: {
        height: this.map.height,
        width: this.map.width,
        cells: this.map.cells.map(cell => cell.clone())
      },
      turn: this.turn,
      entities: this.entityManager.getList().map(entity => entity.clone()),
      players: this.playerManager.getList().map(player => player.clone()),
      activePlayer: this.playerManager.getActivePlayer(),
      winner: this.winner ? this.playerManager.getPlayerById(this.winner) : undefined
    };
  }

  dispatchPlayerInput(action: SerializedInput) {
    this.inputReducer.reduce(action);
  }

  dispatchAction(action: SerializedAction) {
    this.actionQueue.push(action);
  }

  subscribe(cb: (e: GameAction<any>) => void) {
    this.emitter.on('game:action', cb);
    return () => this.emitter.off('game:action', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.entityManager.serialize(),
      ...this.playerManager.serialize(),
      map: this.map.serialize(),
      history: this.history.serialize(),
      turn: this.turn
    };
  }
}
