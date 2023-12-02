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

export type GameState = {
  map: GameMap;
  entities: Entity[];
  players: Player[];
  activeEntity: Entity;
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: { id: PlayerId; loadout: Loadout }[];
  history: SerializedAction[];
  activeEntityId?: EntityId;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in EntityEvent | EntityLifecycleEvent as `entity:${Event}`]: Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'history:update': SerializedAction;
  'game:event': SerializedAction;
};

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
  history: ActionHistory;
  atb: ATB;
  emitter: Emitter<GlobalGameEvents>;
};

export class Game {
  private map = new GameMap(this.getContext());

  private playerManager = new PlayerManager(this.getContext());

  private entityManager = new EntityManager(this.getContext());

  private history = new ActionHistory(this.getContext());

  private atb = new ATB();

  private emitter = mitt<GlobalGameEvents>();

  constructor(
    state: SerializedGameState,
    private isAuthoritative: boolean
  ) {
    this.getContext = this.getContext.bind(this);

    this.setupState(state);
    this.setupATB(state.activeEntityId);
    this.setupEvents();
  }

  private setupState(state: SerializedGameState) {
    this.map.setup(state.map);
    this.playerManager.setup(state.players);
    this.entityManager.setup(state.entities);
    this.history.setup(state.history);
  }

  private setupEvents() {
    this.emitter.on('entity:turn-end', () => {
      this.atb.tickUntilActiveEntity(this.entityManager.getList());
    });
  }

  private setupATB(activeEntityId?: EntityId) {
    if (activeEntityId) {
      this.atb.activeEntity = this.entityManager.getEntityById(activeEntityId)!;
    } else {
      this.atb.tickUntilActiveEntity(this.entityManager.getList());
    }
  }

  private getContext(): GameContext {
    return {
      get map() {
        return this.map;
      },
      get entityManager() {
        return this.entityManager;
      },
      get playerManager() {
        return this.playerManager;
      },
      get history() {
        return this.history;
      },
      get atb() {
        return this.atb;
      },
      get emitter() {
        return this.emitter;
      }
    };
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
        'Non authoritative game session cannot receive player inputs. Use dispatchEvent instead'
      );
    }
    new InputReducer(this.getContext()).reduce(action);
  }

  dispatchEvent(event: SerializedAction) {
    if (this.isAuthoritative) {
      throw new Error(
        'authoritative game session cannot receive events. Use dispatchPlayerInput instead'
      );
    }
    new ActionReducer(this.getContext()).reduce(event);
  }

  subscribe(cb: (e: SerializedAction) => void) {
    const eventName = this.isAuthoritative ? 'history:update' : ('game:event' as const);
    this.emitter.on(eventName, cb);
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
