import { ActionReducer, RawAction } from './action/action-reducer';
import { ATB } from './atb';
import { EntityId, Entity } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { SerializedEvent } from './event/event';
import { EventHistory } from './event/event-history';
import { GameMap, GameMapOptions } from './map/map';
import { Player, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';
import { Point3D } from './types';
import { UnitId, unitLookup } from './units/unit-lookup';
import { Vec3 } from './utils/vector';

type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<{
    id: EntityId;
    position: Point3D;
    ownerId: PlayerId;
    unitId: UnitId;
  }>;
  players: { id: PlayerId }[];
  history: SerializedEvent<any>[];
  activeEntityId?: EntityId;
};

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
  history: EventHistory;
  atb: ATB;
};

export class Game {
  private map: GameMap;
  private playerManager: PlayerManager;
  private entityManager: EntityManager;
  private history: EventHistory;
  private atb: ATB;

  constructor(state: SerializedGameState) {
    this.map = new GameMap(state.map);
    this.playerManager = new PlayerManager(state.players);
    this.entityManager = new EntityManager(
      state.entities.map(
        e =>
          new Entity(
            e.id,
            Vec3.fromPoint3D(e.position),
            this.playerManager.getPlayerById(e.ownerId)!,
            e.unitId
          )
      )
    );
    this.history = new EventHistory(state.history, this.getContext());
    this.atb = new ATB();
    this.setupATB(state.activeEntityId);
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
      atb: this.atb
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
