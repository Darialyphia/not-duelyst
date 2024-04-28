import EventEmitter from 'eventemitter3';
import { EntitySystem } from './entity/entity-system';
import { BoardSystem, type BoardSystemOptions } from './board/board-system';
import { PlayerSystem } from './player/player-system';
import {
  ENTITY_EVENTS,
  type EntityEvent,
  type EntityEventMap,
  type EntityId,
  type SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable, Prettify } from '@game/shared';
import {
  PLAYER_EVENTS,
  type PlayerEvent,
  type PlayerEventMap,
  type PlayerId,
  type SerializedPlayer
} from './player/player';
import { ActionSystem } from './action/action-system';
import { noopFXContext, type FXSystem } from './fx-system';
import { RNGSystem } from './rng-system';
import { CARD_EVENTS, type CardEvent, type CardEventMap } from './card/card';

export type SerializedGameState = {
  map: BoardSystemOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
};

type GlobalEntityEvents = {
  [Event in EntityEvent as `entity:${Event}`]: EntityEventMap[Event];
};
type GlobalPlayerEvents = {
  [Event in PlayerEvent as `player:${Event}`]: PlayerEventMap[Event];
};
type GlobalCardEvents = {
  [Event in CardEvent as `card:${Event}`]: CardEventMap[Event];
};

type GameEventsBase = {
  '*': [string];
  'game:action': [GameAction<any>];
  'scheduler:flushed': [];
  'game:ready': [];
  'game:ended': [PlayerId];
};
export type GameEventMap = Prettify<
  GameEventsBase & GlobalEntityEvents & GlobalPlayerEvents & GlobalCardEvents
>;
export type GameEvent = keyof GameEventMap;

export class GameSession extends EventEmitter<GameEventMap> {
  static createServerSession(state: SerializedGameState, seed: string) {
    return new GameSession(state, {
      seed,
      isAuthoritative: true,
      fxSystem: noopFXContext
    });
  }

  static createClientSession(
    state: SerializedGameState,
    seed: string,
    fxSystem: FXSystem
  ) {
    return new GameSession(state, { seed, isAuthoritative: false, fxSystem });
  }

  readonly isAuthoritative: boolean;

  seed: string;

  actionSystem = new ActionSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  boardSystem = new BoardSystem(this);

  rngSystem = new RNGSystem();

  isReady = false;

  fxSystem = noopFXContext;

  private constructor(
    private initialState: SerializedGameState,
    options: {
      isAuthoritative: boolean;
      seed: string;
      fxSystem: FXSystem;
    }
  ) {
    super();
    this.isAuthoritative = options.isAuthoritative;

    this.seed = options.seed;
    this.setup(options.fxSystem);
  }

  private setupStarEvents() {
    [
      ...Object.values(ENTITY_EVENTS).map(e => `entity:${e}`),
      ...Object.values(PLAYER_EVENTS).map(e => `player:${e}`),
      ...Object.values(CARD_EVENTS).map(e => `card:${e}`),
      'game:action',
      'game:ready'
    ].forEach(eventName => {
      this.on(eventName as any, () => {
        this.emit('*', eventName);
      });
    });
  }

  private async setup(fxSystem: FXSystem) {
    if (this.isReady) return;
    this.isReady = true;
    this.setupStarEvents();

    this.rngSystem.setup(this.seed);
    this.boardSystem.setup(this.initialState.map);
    this.playerSystem.setup(this.initialState.players);
    this.entitySystem.setup(this.initialState.entities);
    await this.actionSystem.setup(this.initialState.history);

    this.fxSystem = fxSystem;
    this.emit('game:ready');
    this.on('entity:after_destroy', e => {
      if (e.isGeneral) {
        this.emit('game:ended', e.player.opponent.id);
      }
    });
  }

  dispatch(action: SerializedAction) {
    this.actionSystem.dispatch(action);
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      history: this.actionSystem.serialize()
    };
  }
}
