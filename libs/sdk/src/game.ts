import mitt, { type Emitter } from 'mitt';
import { ActionReducer, RawAction } from './action/action-reducer';
import { ATB } from './atb';
import {
  EntityId,
  Entity,
  SerializedEntity,
  EntityEvent
} from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { SerializedEvent } from './event/event';
import { EventHistory } from './event/event-history';
import { GameMap, GameMapOptions } from './map/map';
import { Loadout, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';

type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: { id: PlayerId; loadout: Loadout }[];
  history: SerializedEvent<any>[];
  activeEntityId?: EntityId;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in EntityEvent | EntityLifecycleEvent as `entity:${Event}`]: Entity;
};

type GlobalGameEvents = GlobalEntityEvents;

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
  history: EventHistory;
  atb: ATB;
  emitter: Emitter<GlobalGameEvents>;
};

export class Game {
  private map = new GameMap(this.getContext());
  private playerManager = new PlayerManager(this.getContext());
  private entityManager = new EntityManager(this.getContext());
  private history = new EventHistory(this.getContext());
  private atb = new ATB();
  private emitter: Emitter<GlobalGameEvents> = mitt();

  constructor(state: SerializedGameState) {
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
    this.emitter.on('entity:after-turn-end', () => {
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

  dispatch(action: RawAction) {
    new ActionReducer(this.getContext()).reduce(action);
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
