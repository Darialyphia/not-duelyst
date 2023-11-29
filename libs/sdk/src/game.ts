import mitt, { type Emitter } from 'mitt';
import { ActionReducer, RawAction } from './action/action-reducer';
import { ATB } from './atb';
import { EntityId, Entity, SerializedEntity } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { SerializedEvent } from './event/event';
import { EventHistory } from './event/event-history';
import { GameMap, GameMapOptions } from './map/map';
import { PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';

type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: { id: PlayerId }[];
  history: SerializedEvent<any>[];
  activeEntityId?: EntityId;
};

type GlobalGameEvents = {
  'entity:created': Entity;
  'entity:before-move': Entity;
  'entity:after-move': Entity;
  'entity:before-turn-start': Entity;
  'entity:after-turn-start': Entity;
  'entity:before-turn-end': Entity;
  'entity:after-turn-end': Entity;
};

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
  history: EventHistory;
  atb: ATB;
  emitter: Emitter<GlobalGameEvents>;
};

export type LazyGameContext = () => GameContext;

export class Game {
  private map: GameMap;
  private playerManager: PlayerManager;
  private entityManager: EntityManager;
  private history: EventHistory;
  private atb: ATB;
  private emitter: Emitter<GlobalGameEvents> = mitt();

  constructor(state: SerializedGameState) {
    this.map = new GameMap(state.map);
    this.playerManager = new PlayerManager(state.players);
    this.entityManager = new EntityManager(this.getContext, state.entities);
    this.history = new EventHistory(state.history, this.getContext());
    this.atb = new ATB();
    this.setupATB(state.activeEntityId);

    this.getContext = this.getContext.bind(this);
  }

  private setupATB(activeEntityId?: EntityId) {
    if (activeEntityId) {
      const activeEntity = this.entityManager.getEntityById(activeEntityId);
      if (!activeEntity)
        throw new Error(`Couldnt find active entity with id ${activeEntityId}`);

      this.atb.activeEntity = activeEntity;
    } else {
      this.atb.tickUntilActiveEntity(this.entityManager.getList());
    }
  }
  private getContext(): GameContext {
    return {
      map: this.map,
      entityManager: this.entityManager,
      playerManager: this.playerManager,
      history: this.history,
      atb: this.atb,
      emitter: this.emitter
    };
  }

  dispatch(action: RawAction) {
    new ActionReducer(this.getContext).reduce(action);
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
