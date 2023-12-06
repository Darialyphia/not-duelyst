import mitt, { type Emitter } from 'mitt';
import { InputReducer, SerializedInput } from './input/input-reducer';
import { ATB } from './atb';
import { EntityId, Entity, SerializedEntity, EntityEvent } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { ActionHistory } from './action/action-history';
import { GameMap, GameMapOptions } from './map/map';
import { Loadout, Player, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';
import { ActionReducer, SerializedAction } from './action/action-reducer';
import { UnitId } from './units/unit-lookup';

export type GameState = {
  map: GameMap;
  entities: Entity[];
  players: Player[];
  activeEntity: Entity;
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: { id: PlayerId; loadout: Loadout; generalId: UnitId }[];
  history: SerializedAction[];
  activeEntityId?: EntityId;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in EntityEvent | EntityLifecycleEvent as `entity:${Event}`]: Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'history:update': SerializedAction;
};

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
  history: ActionHistory;
  atb: ATB;
  emitter: Emitter<GlobalGameEvents>;
  isAuthoritative: boolean;
};

export class GameSession {
  static createServerSession(state: SerializedGameState) {
    return new GameSession(state, true);
  }

  static createClientSession(state: SerializedGameState) {
    return new GameSession(state, false);
  }

  private map = new GameMap(this.getContext());

  private playerManager = new PlayerManager(this.getContext());

  private entityManager = new EntityManager(this.getContext());

  private history = new ActionHistory(this.getContext());

  private atb = new ATB();

  private emitter = mitt<GlobalGameEvents>();

  private constructor(
    state: SerializedGameState,
    private isAuthoritative: boolean
  ) {
    this.getContext = this.getContext.bind(this);

    this.setupState(state);
    this.setupATB(state.activeEntityId);
  }

  private setupState(state: SerializedGameState) {
    this.map.setup(state.map);
    this.playerManager.setup(state.players);
    this.entityManager.setup(state.entities);
    this.history.setup(state.history);

    if (!this.entityManager.getList().length) {
      this.playerManager.getList().forEach((player, index) => {
        this.entityManager.addEntity({
          atbSeed: Math.random(),
          playerId: player.id,
          unitId: player.generalId,
          position: state.map.startPositions[index]
        });
      });
    }
  }

  private setupATB(activeEntityId?: EntityId) {
    if (activeEntityId) {
      this.atb.activeEntity = this.entityManager.getEntityById(activeEntityId)!;
    } else {
      this.atb.tickUntilActiveEntity(this.entityManager.getList());
    }
  }

  getContext(): GameContext {
    return new Proxy(this, {
      get(obj, prop) {
        // @ts-ignore
        return obj[prop];
      }
    }) as unknown as GameContext;
  }

  getState(): Readonly<GameState> {
    return {
      map: this.map,
      entities: this.entityManager.getList(),
      players: this.playerManager.getList(),
      activeEntity: this.atb.activeEntity
    };
  }

  dispatchPlayerInput(action: SerializedInput) {
    if (!this.isAuthoritative) {
      throw new Error(
        'Non authoritative game session cannot receive player inputs. Use dispatchAction instead'
      );
    }
    new InputReducer(this.getContext()).reduce(action);
  }

  dispatchAction(event: SerializedAction) {
    if (this.isAuthoritative) {
      throw new Error(
        'authoritative game session cannot receive actions. Use dispatchPlayerInput instead'
      );
    }
    new ActionReducer(this.getContext()).reduce(event);
  }

  subscribe(cb: (e: SerializedAction) => void) {
    this.emitter.on('history:update', cb);
    return () => this.emitter.off('history:update', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.entityManager.serialize(),
      map: this.map.serialize(),
      players: this.playerManager.serialize(),
      history: this.history.serialize()
    };
  }
}
