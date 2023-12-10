import mitt, { type Emitter } from 'mitt';
import { InputReducer, SerializedInput } from './input/input-reducer';
import { ATB } from './atb';
import { EntityId, Entity, SerializedEntity, EntityEvent } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { ActionHistory } from './action/action-history';
import { GameMap, GameMapOptions } from './map/map';
import { Loadout, Player, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';
import { ActionDeserializer, SerializedAction } from './action/action-deserializer';
import { UnitId } from './units/unit-lookup';
import { isGeneral } from './entity/entity-utils';
import { clamp } from '@hc/shared';
import { ActionQueue } from './action/action-queue';
import { FXContext, GameAction } from './action/action';

export type GameState = {
  map: Pick<GameMap, 'height' | 'width' | 'cells'>;
  entities: Entity[];
  players: Player[];
  activeEntity: Entity;
  winner?: Player;
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
  'game:action': GameAction<any>;
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

  atb = new ATB();

  emitter = mitt<GlobalGameEvents>();

  nextEventId = 1;

  fxContext?: FXContext;

  winner?: PlayerId;

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
          unit.cooldown = clamp(unit.cooldown - 1, 0, Infinity);
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
      map: {
        height: this.map.height,
        width: this.map.width,
        cells: this.map.cells.map(cell => cell.clone())
      },
      entities: this.entityManager.getList().map(entity => entity.clone()),
      players: this.playerManager.getList().map(player => player.clone()),
      activeEntity: this.atb.activeEntity.clone(),
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
      map: this.map.serialize(),
      players: this.playerManager.serialize(),
      history: this.history.serialize()
    };
  }
}
