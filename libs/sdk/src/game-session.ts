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
import { isGeneral } from './entity/entity-utils';

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

  actionReducer = new ActionReducer(this);

  inputReducer = new InputReducer(this);

  atb = new ATB();

  emitter = mitt<GlobalGameEvents>();

  private constructor(
    state: SerializedGameState,
    readonly isAuthoritative: boolean
  ) {
    this.setupState(state);

    this.emitter.on('entity:turn-start', entity => {
      if (isGeneral(entity)) {
        Object.values(
          this.playerManager.getPlayerById(entity.playerId)!.loadout.units
        ).forEach(unit => {
          unit.cooldown = Math.max(0, unit.cooldown - 1);
        });
      }
    });

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

  getState(): Readonly<GameState> {
    return {
      map: this.map,
      entities: this.entityManager.getList(),
      players: this.playerManager.getList(),
      activeEntity: this.atb.activeEntity
    };
  }

  dispatchPlayerInput(action: SerializedInput) {
    this.inputReducer.reduce(action);
  }

  dispatchAction(event: SerializedAction) {
    this.actionReducer.reduce(event);
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
